```sh
# Create a chapter
docker compose run --rm hugo new --kind chapter codes/_index.md

# Create a page
docker compose run --rm hugo new codes/invalidate.md

# Troubleshooting
docker compose run --rm hugo --templateMetrics --templateMetricsHints

# Update to latest version
docker compose run --rm git submodule update --remote --merge

# OR checkout a specific tag version
docker compose run --rm git -C app/themes/blowfish fetch --tags
docker compose run --rm git -C app/themes/blowfish checkout tags/v2.97.0
```
