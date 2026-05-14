package com.example.demo;

import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DataSourceConfiguration {

	@Bean
	@Primary
	public DataSource dataSource(Environment env) {
		String connectionString = resolveConnectionString(env);
		if (connectionString != null && !connectionString.isBlank()) {
			String trimmed = connectionString.strip();
			if (trimmed.startsWith("jdbc:")) {
				return fromJdbcProperties(env, trimmed);
			}
			return fromPostgresUri(trimmed);
		}
		String url = env.getProperty("spring.datasource.url");
		if (url != null && !url.isBlank()) {
			return fromJdbcProperties(env, url.strip());
		}
		throw new IllegalStateException(
				"No database URL found. On Railway: add PostgreSQL, link it to this service "
						+ "(DATABASE_URL), or set spring.datasource.url. Locally: put DATABASE_URL in .env "
						+ "like the Node API.");
	}

	/** Postgres URI (postgresql://…) or JDBC URL from env / Railway aliases. */
	private static String resolveConnectionString(Environment env) {
		String[] keys = {
				"DATABASE_URL",
				"DATABASE_PUBLIC_URL",
				"SPRING_DATASOURCE_URL",
		};
		for (String key : keys) {
			String v = env.getProperty(key);
			if (v != null && !v.isBlank()) {
				return v;
			}
		}
		return buildPostgresUriFromRailwayPgVars(env);
	}

	private static String buildPostgresUriFromRailwayPgVars(Environment env) {
		String host = env.getProperty("PGHOST");
		if (host == null || host.isBlank()) {
			return null;
		}
		String port = env.getProperty("PGPORT", "5432");
		String user = env.getProperty("PGUSER");
		if (user == null || user.isBlank()) {
			user = "postgres";
		}
		String password = env.getProperty("PGPASSWORD", "");
		String db = env.getProperty("PGDATABASE");
		if (db == null || db.isBlank()) {
			db = "postgres";
		}
		String u = URLEncoder.encode(user, StandardCharsets.UTF_8);
		String p = URLEncoder.encode(password, StandardCharsets.UTF_8);
		return String.format("postgresql://%s:%s@%s:%s/%s", u, p, host, port, db);
	}

	private static DataSource fromJdbcProperties(Environment env, String jdbcUrl) {
		var ds = new HikariDataSource();
		ds.setJdbcUrl(jdbcUrl);
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
