package com.example.Portfolio.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Portfolio Management API", version = "v1", description = "API cho hệ thống quản lý portfolio cá nhân", contact = @Contact(name = "Phạm Quốc Huân", email = "admin@portfolio.local")),

        servers = @Server(url = "http://localhost:8080", description = "Local"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT", description = "Dẫn accessToken lấy từ POST /api/auth/login")

public class OpenApiConfig {

}
