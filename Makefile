.PHONY: run build clean docs

run:
	go run cmd/server/main.go

build: clean docs
	cd frontend && npm run build
	mkdir -p build
	@if command -v go >/dev/null 2>&1; then \
		go build -o server cmd/server/main.go; \
		mv server build; \
	else \
		echo Go not found. Skipping go build...; \
	fi
	cp -r frontend/dist/* build
	cp -r docs build

clean:
	cd frontend && rm -rf dist
	rm -rf build

docs:
	@if command -v go >/dev/null 2>&1; then \
		swag init -g api/index.go --dir ./; \
	else \
		echo swag is not installed. Please install it and continue; \
	fi
 
