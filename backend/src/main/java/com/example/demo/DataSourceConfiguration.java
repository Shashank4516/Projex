package com.example.demo;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DataSourceConfiguration {

	@Bean
	@Primary
	public DataSource dataSource(Environment env,
			@Value("${DATABASE_URL:}") String databaseUrl) {
		if (databaseUrl != null && !databaseUrl.isBlank()) {
			return fromPostgresUri(databaseUrl);
		}
		String url = env.getProperty("spring.datasource.url");
		if (url == null || url.isBlank()) {
			throw new IllegalStateException(
					"Set DATABASE_URL in .env (same as the Node API) or spring.datasource.url for local JDBC.");
		}
		var ds = new HikariDataSource();
		ds.setJdbcUrl(url);
		ds.setUsername(env.getProperty("spring.datasource.username", ""));
		ds.setPassword(env.getProperty("spring.datasource.password", ""));
		String driver = env.getProperty("spring.datasource.driver-class-name");
		if (driver == null) {
			driver = env.getProperty("spring.datasource.driverClassName");
		}
		if (driver != null && !driver.isBlank()) {
			ds.setDriverClassName(driver);
		}
		return ds;
	}

	private static DataSource fromPostgresUri(String databaseUrl) {
		String normalized = databaseUrl.replaceFirst("^postgres(ql)?:", "http:");
		URI uri = URI.create(normalized);
		String userInfo = uri.getUserInfo();
		String username = "";
		String password = "";
		if (userInfo != null) {
			int colon = userInfo.indexOf(':');
			if (colon >= 0) {
				username = URLDecoder.decode(userInfo.substring(0, colon), StandardCharsets.UTF_8);
				password = URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8);
			}
			else {
				username = URLDecoder.decode(userInfo, StandardCharsets.UTF_8);
			}
		}
		String host = uri.getHost();
		int port = uri.getPort() > 0 ? uri.getPort() : 5432;
		String path = uri.getPath();
		if (path != null && path.startsWith("/")) {
			path = path.substring(1);
		}
		if (path == null || path.isEmpty()) {
			path = "postgres";
		}
		StringBuilder jdbc = new StringBuilder();
		jdbc.append("jdbc:postgresql://").append(host).append(":").append(port).append("/").append(path);
		String query = uri.getRawQuery();
		boolean needsSsl = needsSslAppend(databaseUrl);
		if (query != null && !query.isEmpty()) {
			jdbc.append("?").append(query);
			if (needsSsl && !query.contains("sslmode")) {
				jdbc.append("&sslmode=require");
			}
		}
		else if (needsSsl) {
			jdbc.append("?sslmode=require");
		}
		var ds = new HikariDataSource();
		ds.setJdbcUrl(jdbc.toString());
		ds.setUsername(username);
		ds.setPassword(password);
		ds.setDriverClassName("org.postgresql.Driver");
		return ds;
	}

	private static boolean needsSslAppend(String databaseUrl) {
		if (System.getenv("DATABASE_SSL") != null
				&& "false".equalsIgnoreCase(System.getenv("DATABASE_SSL"))) {
			return false;
		}
		return databaseUrl.matches("(?i).*(railway|rlwy|sslmode=require).*");
	}
}
