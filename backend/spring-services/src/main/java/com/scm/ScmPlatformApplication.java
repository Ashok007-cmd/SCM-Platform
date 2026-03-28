package com.scm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SCM Platform — Spring Boot 3.2 Application Entry Point
 *
 * Modules enabled:
 *   - JPA auditing (createdAt / updatedAt auto-population)
 *   - Redis caching
 *   - Kafka event streaming
 *   - Async task execution
 *   - Scheduled jobs (reorder checks, report generation)
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
@EnableKafka
@EnableAsync
@EnableScheduling
public class ScmPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScmPlatformApplication.class, args);
    }
}
