package com.example.demo;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {

	@Id
	@Column(length = 512)
	private String id;

	@Column(nullable = false)
	private String title;

	/** JSON array (Postgres jsonb in legacy DB; TEXT avoids varchar limits for large payloads). */
	@Column(name = "tags", nullable = false, columnDefinition = "text")
	private String tags;

	/** Paths or data URLs — often > 8k when base64 images are stored inline. */
	@Column(name = "banner_src", nullable = false, columnDefinition = "text")
	private String bannerSrc;

	@Column(name = "deployed_url", nullable = false, columnDefinition = "text")
	private String deployedUrl = "#";

	@Column(name = "owner_photo_url", nullable = false, columnDefinition = "text")
	private String ownerPhotoUrl = "";

	/** Firebase Auth uid of the creator when available (for profile, leaderboard grouping, follows). */
	@Column(name = "owner_uid", nullable = false, length = 128, columnDefinition = "varchar(128) default ''")
	private String ownerUid = "";

	/** Denormalized from user profile when the project is created (or synced from settings). */
	@Column(name = "owner_country", nullable = true, length = 128, columnDefinition = "varchar(128) default ''")
	private String ownerCountry = "";

	@Column(nullable = false)
	private int likes;

	@Column(name = "liked_by_user", nullable = false)
	private boolean likedByUser;

	@Column(name = "saved_by_user", nullable = false)
	private boolean savedByUser;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}

	public String getBannerSrc() {
		return bannerSrc;
	}

	public void setBannerSrc(String bannerSrc) {
		this.bannerSrc = bannerSrc;
	}

	public String getDeployedUrl() {
		return deployedUrl;
	}

	public void setDeployedUrl(String deployedUrl) {
		this.deployedUrl = deployedUrl;
	}

	public String getOwnerPhotoUrl() {
		return ownerPhotoUrl;
	}

	public void setOwnerPhotoUrl(String ownerPhotoUrl) {
		this.ownerPhotoUrl = ownerPhotoUrl;
	}

	public String getOwnerUid() {
		return ownerUid != null ? ownerUid : "";
	}

	public void setOwnerUid(String ownerUid) {
		this.ownerUid = ownerUid != null ? ownerUid : "";
	}

	public String getOwnerCountry() {
		return ownerCountry != null ? ownerCountry : "";
	}

	public void setOwnerCountry(String ownerCountry) {
		this.ownerCountry = ownerCountry != null ? ownerCountry : "";
	}

	public int getLikes() {
		return likes;
	}

	public void setLikes(int likes) {
		this.likes = likes;
	}

	public boolean isLikedByUser() {
		return likedByUser;
	}

	public void setLikedByUser(boolean likedByUser) {
		this.likedByUser = likedByUser;
	}

	public boolean isSavedByUser() {
		return savedByUser;
	}

	public void setSavedByUser(boolean savedByUser) {
		this.savedByUser = savedByUser;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
