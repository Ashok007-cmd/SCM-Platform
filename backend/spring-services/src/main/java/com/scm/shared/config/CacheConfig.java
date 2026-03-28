package com.scm.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.*;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${spring.cache.redis.time-to-live:600000}")
    private long defaultTtlMs;

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        var jsonSerializer = new GenericJackson2JsonRedisSerializer();
        var valueSerializer = RedisSerializationContext.SerializationPair
            .fromSerializer(jsonSerializer);

        var defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMillis(defaultTtlMs))
            .serializeValuesWith(valueSerializer)
            .disableCachingNullValues();

        var cacheConfigs = Map.of(
            "suppliers",       defaultConfig.entryTtl(Duration.ofMinutes(10)),
            "inventory-stats", defaultConfig.entryTtl(Duration.ofMinutes(5)),
            "warehouse-stats", defaultConfig.entryTtl(Duration.ofMinutes(5)),
            "analytics",       defaultConfig.entryTtl(Duration.ofMinutes(15))
        );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigs)
            .build();
    }
}
