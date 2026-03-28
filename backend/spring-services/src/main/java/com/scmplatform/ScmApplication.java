package com.scmplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SCM Platform — Main Spring Boot Application Entry Point
 *
 * Modules covered:
 *  - Inventory Management
 *  - Supplier Management
 *  - Order Management
 *  - Demand Forecasting (AI/ML integration)
 *  - Logistics & Shipment Tracking
 *  - Warehouse Management
 *  - Financial & Cost Management
 *  - Compliance & Sustainability
 */
@SpringBootApplication
@EnableCaching
@EnableKafka
@EnableAsync
@EnableScheduling
public class ScmApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScmApplication.class, args);
    }
}
