# required cli tools: taplo-cli,cargo-edit
# Installation by cargo
# cargo install taplo-cli
# cargo install cargo-edit -f --no-default-features --features "set-version"

set windows-shell := ["cmd.exe", "/c"]

alias pr := prepare-release
alias dt := delete-tag

default:
	just --list --unsorted

toolchain:
	rustup -V
	rustc -V
	cargo -V
	cargo fmt --version
	cargo clippy -V
	node -v
	npm -v
	pnpm -v
	pnpm tauri -V

run:
	pnpm tsx ./scripts/run.ts

fmt:
	pnpm biome check --linter-enabled=false --write
	cargo fmt
	taplo fmt

check:
	cargo fmt --check
	taplo fmt --check
	cargo clippy --no-deps --all-features -- -D warnings
	pnpm biome check
	just typecheck

typecheck:
	pnpm tsc -p ./ui/tsconfig.json --noEmit
	pnpm tsc -p ./tsconfig.json --noEmit

prepare-release type:
	pnpm tsx ./scripts/prepare-release.ts {{type}}

release:
	pnpm tsx ./scripts/release.ts

delete-tag tag:
	git tag -d {{tag}}
	git push origin --delete {{tag}}

pnpm +args:
	pnpm {{args}} --filter ./ui

bundle-test-app:
	node --run build:ui
	pnpm tauri build -d
