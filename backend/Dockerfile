FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace

# copy everything and build
COPY . .
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app

# copy jar from builder (use wildcard since artifactId/version may vary)
COPY --from=builder /workspace/target/*.jar ./app.jar

EXPOSE 8080
CMD ["java", "-jar", "/app/app.jar"]
