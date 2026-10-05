export const DOCKER_COMPOSE_YML = `version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: finwise-mysql
    restart: always
    environment:
      MYSQL_DATABASE: finwise_db
      MYSQL_USER: finwise_user
      MYSQL_PASSWORD: FinWiseStrongPassword2026!
      MYSQL_ROOT_PASSWORD: RootSecurePassword2026!
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-pRootSecurePassword2026!"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - finwise-network

  redis:
    image: redis:7.0-alpine
    container_name: finwise-redis
    restart: always
    command: redis-server --appendonly yes --requirepass "RedisSecureAuth2026!"
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "RedisSecureAuth2026!", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - finwise-network

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: finwise-rabbitmq
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: finwise_rabbit
      RABBITMQ_DEFAULT_PASS: RabbitSecurePass2026!
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - finwise-network

  finwise-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finwise-app
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - finwise-network

volumes:
  mysql_data:
  redis_data:
  rabbitmq_data:

networks:
  finwise-network:
    driver: bridge`;

export const DOCKERFILE_CONTENT = `# Multi-stage Dockerfile with eclipse-temurin:17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S finwise && adduser -S finwise -G finwise
WORKDIR /app
COPY --from=builder /app/target/finwise-backend-*.jar app.jar
RUN chown -R finwise:finwise /app
USER finwise
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`;

export const TESTCONTAINER_JAVA = `package com.finwise.integration;

import com.finwise.service.AccountService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.*;
import org.testcontainers.containers.*;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class FinWiseIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7.0-alpine").withExposedPorts(6379);

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.data.redis.host", redis::getHost);
    }

    @Autowired
    private AccountService accountService;

    @Test
    void testEndToEndAccountTransfer() {
        // Validates atomic ledger transfer against real MySQL container
    }
}`;
