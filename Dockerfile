# Vite/React static site.
#
# Railway → set Root Directory to REPO ROOT (this folder): "/" or leave blank.
# Do NOT use "/backend" or "/src" — those folders have no package.json.
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Single copy so misconfigured roots fail with a clear message below.
COPY . .

RUN test -f package.json || (\
	echo >&2 ""; \
	echo >&2 "=== Railway misconfiguration ==="; \
	echo >&2 "package.json is missing from the Docker build context."; \
	echo >&2 "For the FRONTEND service, set Root Directory to repo root (\"/\"),"; \
	echo >&2 "NOT \"/backend\". Use \"/backend\" only for the Spring Boot API service."; \
	echo >&2 "================================"; \
	echo >&2 ""; \
	exit 1)

RUN npm ci
ENV NODE_ENV=production
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l \"${PORT}\""]
