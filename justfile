# required cli tools: taplo-cli,cargo-edit
# Installation by cargo
# cargo install taplo-cli
# cargo install cargo-edit -f --no-default-features --features "set-version"

alias pr := prepare-release
alias pt := push-tag
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

fmt:
	node --run fmt
	cargo fmt
	taplo fmt

check:
	cargo fmt --check
	taplo fmt --check
	cargo clippy --no-deps --all-features -- -D warnings
	just typecheck

typecheck:
	node --run typecheck:ui
	node --run typecheck:other

prepare-release tag:
	pnpm tsx ./scripts/set-pkg-version.ts {{tag}}
	cargo set-version {{tag}}
	just fmt
	git commit -am "prepare release {{tag}}"

push-tag tag:
	git tag {{tag}}
	git push origin {{tag}}

delete-tag tag:
	git tag -d {{tag}}
	git push origin --delete {{tag}}

pnpm +args:
	pnpm {{args}} --filter ./ui

bundle-test-app:
	node --run build:ui
	pnpm tauri build -d --bundles app
