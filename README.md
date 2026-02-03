# Chorgemeinschaft Köngen - Website

Dies ist das Repository für die Website der [Chorgemeinschaft Köngen](https://www.chorgemeinschaft-koengen.de).

[![Aktueller Status](https://github.com/flohoss/chorgemeinschaft-koengen/actions/workflows/hugo.yaml/badge.svg)](https://github.com/flohoss/chorgemeinschaft-koengen/actions/workflows/hugo.yaml)

## Development

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
