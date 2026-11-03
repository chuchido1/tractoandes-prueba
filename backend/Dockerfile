# Etapa 1: compila el JAR dentro de Docker (no hace falta Java ni Maven locales).
FROM eclipse-temurin:21.0.13_9-jdk-noble AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package

# Etapa 2: imagen final sólo con el JRE y el JAR, sin usuario root.
FROM eclipse-temurin:21.0.13_9-jre-noble
RUN useradd --system --uid 10001 --no-create-home app
WORKDIR /app
COPY --from=build /workspace/target/catalog-*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
