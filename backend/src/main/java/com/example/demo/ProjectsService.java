package com.example.demo;

import java.sql.SQLException;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class ProjectsService {

	private final ProjectRepository repository;
	private final ObjectMapper objectMapper;

	public ProjectsService(ProjectRepository repository, ObjectMapper objectMapper) {
		this.repository = repository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<ProjectSummaryResponse> listSummaries() {
		return repository.findAllSummariesRaw().stream().map(ProjectSummaryResponse::fromJdbcRow).toList();
	}

	@Transactional(readOnly = true)
	public ProjectResponse getById(String id) {
		return repository.findById(id)
				.map(ProjectResponse::fromEntity)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
	}

	/** True if any non-placeholder project already uses this deploy URL (after normalization). */
	@Transactional(readOnly = true)
	public boolean isDeployedUrlTaken(String rawInput) {
		String normalized = DeployUrlNormalizer.normalizeForStorage(rawInput != null ? rawInput : "");
		if (DeployUrlNormalizer.isPlaceholder(normalized)) {
			return false;
		}
		for (Project existing : repository.findProjectsWithNonPlaceholderDeployUrl()) {
			String raw = existing.getDeployedUrl();
			if (raw == null || DeployUrlNormalizer.isPlaceholder(raw.strip())) {
				continue;
			}
			if (DeployUrlNormalizer.normalizeForStorage(raw).equals(normalized)) {
				return true;
			}
		}
		return false;
	}

	@Transactional
	public ProjectResponse create(ProjectCreateBody body) {
		if (body.id() == null || body.id().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id, title, and bannerSrc are required");
		}
		if (body.title() == null || body.title().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id, title, and bannerSrc are required");
		}
		if (body.bannerSrc() == null || body.bannerSrc().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id, title, and bannerSrc are required");
		}
		var p = new Project();
		p.setId(body.id());
		p.setTitle(body.title().trim());
		try {
			p.setTags(objectMapper.writeValueAsString(body.tags() != null ? body.tags() : List.of()));
		}
		catch (JacksonException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tags", e);
		}
		p.setBannerSrc(body.bannerSrc());
		String deployed = DeployUrlNormalizer.normalizeForStorage(
				body.deployedUrl() != null ? body.deployedUrl() : DeployUrlNormalizer.PLACEHOLDER);
		if (!DeployUrlNormalizer.isPlaceholder(deployed) && isDeployedUrlTaken(deployed)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "This project already exists");
		}
		p.setDeployedUrl(deployed);
		p.setOwnerPhotoUrl(body.ownerPhotoURL() != null ? body.ownerPhotoURL() : "");
		p.setOwnerUid(body.ownerUid() != null ? body.ownerUid().strip() : "");
		p.setOwnerCountry(body.ownerCountry() != null ? body.ownerCountry().strip() : "");
		p.setLikes(body.likes() != null && body.likes() >= 0 ? body.likes() : 0);
		p.setLikedByUser(Boolean.TRUE.equals(body.likedByUser()));
		p.setSavedByUser(Boolean.TRUE.equals(body.savedByUser()));
		try {
			repository.save(p);
		}
		catch (DataIntegrityViolationException ex) {
			if (isUniqueViolation(ex)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Project id already exists");
			}
			throw ex;
		}
		return ProjectResponse.fromEntity(p);
	}

	@Transactional
	public ProjectResponse patch(String id, ProjectPatchBody body) {
		boolean any = body.likes() != null || body.likedByUser() != null || body.savedByUser() != null
				|| body.ownerCountry() != null;
		if (!any) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No updatable fields");
		}
		var p = repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
		if (body.likes() != null) {
			p.setLikes(Math.max(0, body.likes()));
		}
		if (body.likedByUser() != null) {
			p.setLikedByUser(body.likedByUser());
		}
		if (body.savedByUser() != null) {
			p.setSavedByUser(body.savedByUser());
		}
		if (body.ownerCountry() != null) {
			p.setOwnerCountry(body.ownerCountry().strip());
		}
		return ProjectResponse.fromEntity(repository.save(p));
	}

	private static boolean isUniqueViolation(DataIntegrityViolationException ex) {
		var cause = ex.getMostSpecificCause();
		if (cause instanceof SQLException sql) {
			return "23505".equals(sql.getSQLState());
		}
		return false;
	}

}
