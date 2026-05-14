package com.example.demo;

import java.util.List;
import java.util.Map;

public record ProjectCreateBody(
		String id,
		String title,
		List<Map<String, Object>> tags,
		String bannerSrc,
		String deployedUrl,
		String ownerPhotoURL,
		String ownerUid,
		String ownerCountry,
		Integer likes,
		Boolean likedByUser,
		Boolean savedByUser) {
}
