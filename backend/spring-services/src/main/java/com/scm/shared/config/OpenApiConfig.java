package com.scm.shared.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI scmOpenApi() {
        var bearerScheme = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .description("Paste your JWT token (without 'Bearer' prefix)");

        return new OpenAPI()
            .info(new Info()
                .title("SCM Platform API")
                .description("Enterprise Supply Chain Management REST API")
                .version("1.0.0")
                .contact(new Contact()
                    .name("SCM Platform Team")
                    .email("scm-team@example.com"))
                .license(new License().name("MIT")))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", bearerScheme))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
