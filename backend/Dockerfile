# Spring Boot API — use with Railway Root Directory = backend (this folder).
# JDK 21 runs Gradle; Java 25 toolchain for compile is provisioned via Foojay (settings.gradle).
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

FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app
COPY --from=build /app/application.jar /app/application.jar

ENV JAVA_OPTS=""
EXPOSE 8080
# Railway sets PORT; Spring honors server.port from the system property.
CMD ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=\"${PORT:-8080}\" -jar /app/application.jar"]
