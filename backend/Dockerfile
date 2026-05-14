# Spring Boot API — Railway Root Directory = backend (this folder).
# Build: JDK 21 runs Gradle; toolchain Java 25 compiles classes (Foojay in settings.gradle).
# Run: JRE 25 — Java 21 cannot load class file version 69 (Java 25 bytecode).
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

# Must match bytecode produced by Gradle Java toolchain (see build.gradle: Java 25 → class file 69).
FROM eclipse-temurin:25-jre-jammy AS runner
WORKDIR /app
COPY --from=build /app/application.jar /app/application.jar

ENV JAVA_OPTS=""
EXPOSE 8080
# Railway sets PORT; Spring honors server.port from the system property.
CMD ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=\"${PORT:-8080}\" -jar /app/application.jar"]
