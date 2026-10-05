# ==========================================
# STAGE 1: Build & Package Artifact
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# STAGE 2: Minimal Distroless/Alpine Runtime
# ==========================================
FROM eclipse-temurin:17-jre-alpine

# Security hardening: create unprivileged system group & user
RUN addgroup -S finwise && adduser -S finwise -G finwise

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder /app/target/finwise-backend-*.jar app.jar

# Set ownership
RUN chown -R finwise:finwise /app

# Switch to non-root user
USER finwise

# Expose HTTP port
EXPOSE 8080

# Production-grade container JVM options
ENV JAVA_OPTS="-XX:+UseG1GC \
               -XX:MaxRAMPercentage=75.0 \
               -XX:InitialRAMPercentage=50.0 \
               -XX:+ExitOnOutOfMemoryError \
               -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
