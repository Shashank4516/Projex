package com.example.demo;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
@Order(1)
public class SampleProjectSeeder implements ApplicationRunner {

	private static final String SAMPLE_ID = "sample-bardimin";

	private final ProjectRepository repository;
	private final ObjectMapper objectMapper;

	public SampleProjectSeeder(ProjectRepository repository, ObjectMapper objectMapper) {
		this.repository = repository;
		this.objectMapper = objectMapper;
	}

	@Override
	public void run(ApplicationArguments args) throws JacksonException {
		if (repository.existsById(SAMPLE_ID)) {
			return;
		}
		var tags = List.of(
				objectMapper.createObjectNode().put("label", "Fintech").put("kind", "category"),
				objectMapper.createObjectNode().put("label", "React").put("kind", "tech").put("tint", "aqua"),
				objectMapper.createObjectNode().put("label", "Landing-Page").put("kind", "category"),
				objectMapper.createObjectNode().put("label", "Minimalist").put("kind", "category"),
				objectMapper.createObjectNode().put("label", "Javascript").put("kind", "tech").put("tint", "yellow"),
				objectMapper.createObjectNode().put("label", "Node.js").put("kind", "tech").put("tint", "green"));

		var p = new Project();
		p.setId(SAMPLE_ID);
		p.setTitle("Bardimin Smart Lamp Web/UX Revamp");
		p.setTags(objectMapper.writeValueAsString(tags));
		p.setBannerSrc("/figma/card-91-1198/preview.png");
		p.setDeployedUrl("#");
		p.setOwnerPhotoUrl("/figma/card-91-1198/avatar.png");
		p.setLikes(12);
		p.setLikedByUser(false);
		p.setSavedByUser(false);
		repository.save(p);
	}
}
