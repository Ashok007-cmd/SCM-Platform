# ============================================================
# SCM Platform Backend — Multi-stage Dockerfile
# Stage 1: Build with Maven
# Stage 2: Minimal JRE runtime image
# ============================================================

# Stage 1 — Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

COPY spring-services/pom.xml .
COPY spring-services/src ./src

# Download dependencies first (cached layer)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -q

# Build the application
RUN mvn clean package -DskipTests -q

# Stage 2 — Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Security: run as non-root
RUN addgroup -S scm && adduser -S scm -G scm
USER scm

# Copy artifact from build stage
COPY --from=builder /build/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
