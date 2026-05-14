package com.example.demo;

public record ProjectPatchBody(
		Integer likes,
		Boolean likedByUser,
		Boolean savedByUser,
		String ownerCountry) {
}
