## Project Information

This project is a desktop application built with `Tauri v2` that runs on both `macOS` and `Windows`.

The project follows a monorepo structure, with Rust backend code located in the `tauri` directory and frontend code in the `ui` directory.

The frontend technology stack includes: `TypeScript`, `React 18`, `TailwindCSS v3`, `shadcn/ui` components, and `Vite v7`.

The project utilizes the latest stable version of Rust. Currently, the Rust version is `1.89.0` with Edition `2024`.

The development environment uses `Node.js 22.x` with `pnpm` as the package manager.

The minimum supported macOS version is `macOS Monterey`, and the minimum supported Windows version is `Windows 10`.

## Related Commands

Most development commands are available in the `justfile`. Important: Avoid executing commands related to running, testing, or publishing.

To check Rust code: `cargo clippy --no-deps --all-features -- -D warnings`

To check TypeScript/TSX code: `pnpm biome check`

For TypeScript/TSX type checking only: `just typecheck`

To perform a comprehensive codebase check: `just check`

To install Rust dependencies: `cargo add`

To install frontend development dependencies: `pnpm add -D`

To install dependencies in the `ui` directory: `just pnpm add` or `just pnpm add -D`

## UI Directory Guidelines

Do not modify files under `ui/src/components/shadcn/` - these contain the original `shadcn/ui` component implementations.

For customized `shadcn/ui` components, place them in `ui/src/components/custom/`.

Common utility components should be placed in `ui/src/components/`, and only components designed for individual use should be re-exported in `ui/src/components/index.ts`.

## Localization

The project employs `i18next` and `react-i18next` for internationalization. Localization resources are located in `ui/src/i18n/`.

English string mappings are defined in the `en` object within `ui/src/i18n/en.ts`, while Chinese mappings are in the `zh` object in `ui/src/i18n/zh.ts`. Translation keys use concise English words in `camelCase` format.

### Basic Localization Usage

```tsx
import { useT } from "~/hooks";

function ExampleComponent() {
  const t = useT();
  return <div>{t("translationKey")}</div>;
}
```

### Advanced Localization with Interpolation

```ts
// Translation file example
const en = {
  formattedMessage: "Hello, <1>{{name}}</1>! Welcome to our application.",
};
```

```tsx
import { Trans } from "react-i18next";

function WelcomeMessage() {
  return (
    <div>
      <Trans i18nKey="formattedMessage" values={{ name: "User" }}>
        Hello, <span className="highlight" />! Welcome to our application.
      </Trans>
    </div>
  );
}
```

## TypeScript/TSX Code Style

When creating components, follow this pattern:

```tsx
interface ComponentProps {
  className?: string;
  // Additional component properties
}

export function Component({ className, ...props }: ComponentProps) {
  // Component implementation
  return <div className={className}>{/* Component content */}</div>;
}
```

All components use named exports for better tree-shaking and explicit imports.

The path alias for the `src` directory is `~`. For example:

```tsx
import { Component } from "~/components";
import { utilityFunction } from "~/utils";
```

This structure ensures consistent import patterns across the codebase.

### Control Flow Statements

Always use curly braces for early return statements, even for single-line returns:

```tsx
// ✓ Correct
if (!value) {
  return;
}

// ✗ Incorrect
if (!value) return;
```

This applies to all control flow statements including `if`, `for`, `while`, etc., to maintain consistency and readability.
