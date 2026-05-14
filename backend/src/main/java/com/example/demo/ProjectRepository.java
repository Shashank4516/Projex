package com.example.demo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, String> {

	/**
	 * Fetches every column except {@code banner_src} so large base64 payloads are not
	 * read from Postgres for the list endpoint.
	 */
	@Query(value = """
			SELECT id, title, tags, deployed_url, owner_photo_url, owner_uid, owner_country,
			       likes, liked_by_user, saved_by_user, created_at
			FROM projects
			ORDER BY created_at DESC
			""", nativeQuery = true)
	List<Object[]> findAllSummariesRaw();

	@Query("select p from Project p where p.deployedUrl <> '#'")
	List<Project> findProjectsWithNonPlaceholderDeployUrl();
}
