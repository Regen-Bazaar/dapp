**1. File Naming & Organization:**

Naming Pattern Rules

Files : kebab-case
Components: PascalCase
Props: camelCase
Custom Hooks: camelCase with 'use' prefix useAuthState

- Components shadcn or custom low level put in ui folder
- Tests: `*.test.ts(x)` (unit), `*.spec.ts(x)` (integration/E2E).

**2. Import Management:**

- No unused imports.
- Prefer named exports (except for pages/layouts).

**3. TypeScript Usage:**

- Avoid `any`; use `unknown` with type checking.
- Explicit types for function params, returns, props.
- `interface` for object shapes (props, API responses); `type` for unions/aliases.

**4. React & Next.js Specifics:**

- Stable, unique `key` props for lists (not array indices if order changes).
- Default to Server Components; use `"use client"` sparingly (hooks, browser events/APIs).
- Use Next.js `<Link>` (internal navigation), `<Image>` (optimized images with `width`, `height`/`fill`, `alt`).

**5. Accessibility (A11y):**

- Keyboard navigable interactive elements.
- Descriptive `alt` text for images (`alt=""` if decorative).
- `htmlFor` with `id` for form labels.
- Semantic HTML.

**6. Environment Variables:**

- Prefix client-side vars with `NEXT_PUBLIC_`.
- No secrets in `NEXT_PUBLIC_` vars.

**7. Testing:**

- Unit tests coverage 100%
- e2e ui tests using playwright

**8. UI & Styling:**

- Use shadcn/ui components. Add via `bunx shadcn@latest add`.
- Use Tailwind CSS for layout/custom styling.
- Avoid custom CSS/inline `style` if shadcn/ui or Tailwind suffice.

**9. Naming Conventions (Variables & Functions):**

- Descriptive names.
- Event handlers: `handleEventName` (e.g., `handleClick`).

**10. Code Readability & Style:**

- Use early returns for clarity.
- use arrow functions everywhere.
- Adhere strictly to user requirements.
- Plan step-by-step (detailed pseudocode), confirm, then code.
- Write correct, best-practice, DRY, KISS, CUPID, bug-free, functional code
- Prioritize readable code over performance.
- Fully implement requested features; no todos or placeholders.
- Do not do any extra.
- Ensure code is complete and verified.
- State if a correct answer might not exist or if you don't know.
