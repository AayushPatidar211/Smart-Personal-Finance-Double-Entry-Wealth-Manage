package com.finwise.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI finWiseOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FinWise AI — Enterprise Personal Finance & Wealth Ledger API")
                        .description("Production-grade RESTful API documentation for FinWise AI personal finance platform. " +
                                     "Features high-concurrency atomic transfers, Spring Batch 5 automation, multi-bank statement parsing, " +
                                     "Google Gemini 3.8 Flash financial intelligence, and RabbitMQ event streaming.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("FinWise Engineering Team")
                                .email("engineering@finwise.ai")
                                .url("https://finwise.ai"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://api.finwise.ai").description("Production Cloud Cluster")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (obtained via /api/v1/auth/login or /api/v1/auth/2fa/verify).")));
    }
}
