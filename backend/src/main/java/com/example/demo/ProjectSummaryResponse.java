package com.example.demo;

import java.sql.Timestamp;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * List payload without {@code bannerSrc} so large base64 banners are not loaded for every card.
 */
public record ProjectSummaryResponse(
		String id,
		String title,
		JsonNode tags,
		@JsonProperty("deployedUrl") String deployedUrl,
		@JsonProperty("ownerPhotoURL") String ownerPhotoURL,
		@JsonProperty("ownerUid") String ownerUid,
		@JsonProperty("ownerCountry") String ownerCountry,
		int likes,
		@JsonProperty("likedByUser") boolean likedByUser,
		@JsonProperty("savedByUser") boolean savedByUser,
		@JsonProperty("createdAt") Instant createdAt) {

	private static final ObjectMapper MAPPER = JsonMapper.builder().build();

	@SuppressWarnings("null")
	public static ProjectSummaryResponse fromJdbcRow(Object[] r) {
		String id = (String) r[0];
		String title = (String) r[1];
		String tagsJson = r[2] != null ? String.valueOf(r[2]) : "[]";
		JsonNode tagsNode;
		try {
			tagsNode = MAPPER.readTree(tagsJson);
		}
		catch (Exception e) {
			tagsNode = MAPPER.createArrayNode();
		}
		String deployedUrl = r[3] != null ? String.valueOf(r[3]) : "#";
		String ownerPhotoUrl = r[4] != null ? String.valueOf(r[4]) : "";
		String ownerUid = r[5] != null ? String.valueOf(r[5]) : "";
		String ownerCountry = r[6] != null ? String.valueOf(r[6]) : "";
		int likes = toInt(r[7]);
		boolean likedByUser = toBoolean(r[8]);
		boolean savedByUser = toBoolean(r[9]);
		Instant createdAt = toInstant(r[10]);
		return new ProjectSummaryResponse(
				id,
				title,
				tagsNode,
				deployedUrl,
				ownerPhotoUrl,
				ownerUid,
				ownerCountry,
				likes,
				likedByUser,
				savedByUser,
				createdAt);
	}

	private static int toInt(Object v) {
		if (v == null) {
			return 0;
		}
		if (v instanceof Number n) {
			return n.intValue();
		}
		try {
			return Integer.parseInt(String.valueOf(v));
		}
		catch (NumberFormatException e) {
			return 0;
		}
	}

	private static boolean toBoolean(Object v) {
		if (v == null) {
			return false;
		}
		if (v instanceof Boolean b) {
			return b;
		}
		if (v instanceof Number n) {
			return n.intValue() != 0;
		}
		return Boolean.parseBoolean(String.valueOf(v));
	}

	private static Instant toInstant(Object v) {
		if (v == null) {
			return null;
		}
		if (v instanceof Timestamp ts) {
			return ts.toInstant();
		}
		if (v instanceof Instant i) {
			return i;
		}
		if (v instanceof java.util.Date d) {
			return d.toInstant();
		}
		if (v instanceof java.time.OffsetDateTime odt) {
			return odt.toInstant();
		}
		if (v instanceof java.time.ZonedDateTime zdt) {
			return zdt.toInstant();
		}
		return null;
	}
}
