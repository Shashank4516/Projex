package com.example.demo;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(DemoApplication.class, args);
	}

	/**
	 * Loads {@code .env} from the working directory or parent (so running from {@code Projex/} or
	 * {@code Projex/backend/} picks up the same file as Vite/Node). Does not override real env vars.
	 */
	private static void loadDotEnv() {
		Path cwd = Path.of("").toAbsolutePath();
		Path[] candidates = { cwd.resolve(".env"), cwd.getParent() != null ? cwd.getParent().resolve(".env") : null };
		for (Path envFile : candidates) {
			if (envFile == null || !Files.isRegularFile(envFile)) {
				continue;
			}
			Dotenv dotenv = Dotenv.configure()
					.directory(envFile.getParent().toString())
					.ignoreIfMissing()
					.load();
			dotenv.entries().forEach(e -> {
				if (System.getenv(e.getKey()) == null) {
					System.setProperty(e.getKey(), stripQuotes(e.getValue()));
				}
			});
			return;
		}
	}

	private static String stripQuotes(String v) {
		if (v == null) {
			return "";
		}
		String t = v.trim();
		if (t.length() >= 2 && ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'")))) {
			return t.substring(1, t.length() - 1);
		}
		return v;
	}
}
