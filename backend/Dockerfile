# Spring Boot API — Railway Root Directory = backend (this folder).
# Build and run on Java 21 (same major version = no extra toolchain download in Docker).
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
COPY src ./src

RUN chmod +x gradlew \
	&& ./gradlew bootJar -x test -x check -Pproduction --no-daemon \
	&& JAR="$(ls build/libs/*.jar | grep -v plain | head -1)" \
	&& test -n "$JAR" \
	&& cp "$JAR" /app/application.jar

# Must match Gradle Java toolchain in build.gradle (Java 21).
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app
COPY --from=build /app/application.jar /app/application.jar

ENV JAVA_OPTS=""
EXPOSE 8080
# Railway sets PORT; Spring honors server.port from the system property.
CMD ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=\"${PORT:-8080}\" -jar /app/application.jar"]
