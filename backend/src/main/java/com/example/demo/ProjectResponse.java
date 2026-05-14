package com.example.demo;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

public record ProjectResponse(
		String id,
		String title,
		JsonNode tags,
		@JsonProperty("bannerSrc") String bannerSrc,
		@JsonProperty("deployedUrl") String deployedUrl,
		@JsonProperty("ownerPhotoURL") String ownerPhotoURL,
		@JsonProperty("ownerUid") String ownerUid,
		@JsonProperty("ownerCountry") String ownerCountry,
		int likes,
		@JsonProperty("likedByUser") boolean likedByUser,
		@JsonProperty("savedByUser") boolean savedByUser,
		@JsonProperty("createdAt") Instant createdAt) {

	private static final ObjectMapper MAPPER = JsonMapper.builder().build();

	public static ProjectResponse fromEntity(Project p) {
		JsonNode tagsNode;
		try {
			tagsNode = MAPPER.readTree(p.getTags() != null ? p.getTags() : "[]");
		}
		catch (Exception e) {
			tagsNode = MAPPER.createArrayNode();
		}
		return new ProjectResponse(
				p.getId(),
				p.getTitle(),
				tagsNode,
				p.getBannerSrc(),
				p.getDeployedUrl(),
				p.getOwnerPhotoUrl(),
				p.getOwnerUid(),
				p.getOwnerCountry(),
				p.getLikes(),
				p.isLikedByUser(),
				p.isSavedByUser(),
				p.getCreatedAt());
	}
}
