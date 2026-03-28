# ============================================================
# SCM Platform — Spring Boot Multi-Stage Dockerfile
# ============================================================

# Stage 1: Build
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven --no-install-recommends && \
    mvn dependency:go-offline -q && \
    mvn package -DskipTests -q

# Extract layered jar for faster layer caching
RUN java -Djarmode=layertools -jar target/*.jar extract --destination extracted

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM eclipse-temurin:21-jre-jammy AS runtime

# Security: non-root user
RUN groupadd -r scm && useradd -r -g scm scm

# Datadog APM agent
ADD https://dtdg.co/latest-java-tracer /app/dd-java-agent.jar

WORKDIR /app

# Copy layered jar (in dependency → snapshot → spring → app order)
COPY --from=builder /workspace/extracted/dependencies          ./
COPY --from=builder /workspace/extracted/spring-boot-loader   ./
COPY --from=builder /workspace/extracted/snapshot-dependencies ./
COPY --from=builder /workspace/extracted/application           ./

RUN chown -R scm:scm /app
USER scm

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -Dfile.encoding=UTF-8"

ENV DD_AGENT_HOST=datadog-agent \
    DD_SERVICE=scm-backend \
    DD_ENV=production \
    DD_VERSION=1.0.0 \
    DD_LOGS_INJECTION=true \
    DD_TRACE_SAMPLE_RATE=1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -javaagent:/app/dd-java-agent.jar org.springframework.boot.loader.launch.JarLauncher"]
