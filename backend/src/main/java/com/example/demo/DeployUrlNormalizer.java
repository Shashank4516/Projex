package com.example.demo;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

/**
 * Mirrors {@code normalizeDeployedUrl} in the React app so duplicate checks match what users submit.
 */
public final class DeployUrlNormalizer {

	private DeployUrlNormalizer() {
	}

	/** Placeholder when the user leaves the field empty. */
	public static final String PLACEHOLDER = "#";

	public static String normalizeForStorage(String raw) {
		if (raw == null) {
			return PLACEHOLDER;
		}
		String t = raw.trim();
		if (t.isEmpty() || PLACEHOLDER.equals(t)) {
			return PLACEHOLDER;
		}
		try {
			URI uri;
			if (t.regionMatches(true, 0, "http://", 0, 7) || t.regionMatches(true, 0, "https://", 0, 8)) {
				uri = URI.create(t);
			}
			else {
				uri = URI.create("https://" + t);
			}
			uri = withBrowserLikeHostAndPath(uri);
			return uri.normalize().toASCIIString();
		}
		catch (IllegalArgumentException | URISyntaxException ex) {
			return t;
		}
	}

	private static URI withBrowserLikeHostAndPath(URI u) throws URISyntaxException {
		String host = u.getHost();
		if (host != null) {
			host = host.toLowerCase(Locale.ROOT);
		}
		String path = u.getRawPath();
		if (path == null || path.isEmpty()) {
			path = "/";
		}
		return new URI(
				u.getScheme(),
				u.getRawUserInfo(),
				host,
				u.getPort(),
				path,
				u.getRawQuery(),
				u.getRawFragment());
	}

	public static boolean isPlaceholder(String stored) {
		if (stored == null) {
			return true;
		}
		String t = stored.trim();
		return t.isEmpty() || PLACEHOLDER.equals(t);
	}
}
