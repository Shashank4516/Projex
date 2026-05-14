package com.example.demo;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin
public class ProjectsController {

	private final ProjectsService projectsService;

	public ProjectsController(ProjectsService projectsService) {
		this.projectsService = projectsService;
	}

	@GetMapping
	public List<ProjectSummaryResponse> list() {
		try {
			return projectsService.listSummaries();
		}
		catch (ResponseStatusException e) {
			throw e;
		}
		catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load projects", e);
		}
	}

	@GetMapping("/deploy-url-exists")
	public ResponseEntity<DeployUrlAvailability> deployUrlExists(@RequestParam(required = false) String url) {
		boolean taken = projectsService.isDeployedUrlTaken(url);
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore())
				.body(new DeployUrlAvailability(taken));
	}

	@GetMapping("/item/{id}")
	public ProjectResponse getById(@PathVariable String id) {
		try {
			return projectsService.getById(id);
		}
		catch (ResponseStatusException e) {
			throw e;
		}
		catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load project", e);
		}
	}

	@PostMapping
	public ResponseEntity<ProjectResponse> create(@RequestBody ProjectCreateBody body) {
		try {
			return ResponseEntity.status(HttpStatus.CREATED).body(projectsService.create(body));
		}
		catch (ResponseStatusException e) {
			throw e;
		}
		catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save project", e);
		}
	}

	@PatchMapping("/{id}")
	public ProjectResponse patch(@PathVariable String id, @RequestBody ProjectPatchBody body) {
		try {
			return projectsService.patch(id, body);
		}
		catch (ResponseStatusException e) {
			throw e;
		}
		catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update project", e);
		}
	}
}
