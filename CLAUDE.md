# CLAUDE.md — Project Coding Rules

This file defines the rules and standards Claude must follow when working in this project.
These rules apply to every file, every session, every suggestion.

---

## 1. File Size Limit

- **Hard limit: 1,000 lines per file.**
- If a file approaches or exceeds 1,000 lines, stop and split it:
  - Django views → split by resource/domain (e.g. `views/user_views.py`, `views/order_views.py`)
  - Django models → split by domain into separate model files under a `models/` package
  - Serializers, URLs, utils → same pattern: one file per domain
  - React components → one component per file; extract sub-components into their own files
  - React pages → split repeated logic into custom hooks (`hooks/`) or shared components (`components/`)

---

## 2. No Repeated Code — DRY Principle

- **Never write the same logic twice.**
- If a block of code appears (or would appear) in more than one place, extract it:
  - **Python/Django**: write a utility function in `utils.py` or a shared mixin/base class
  - **React/JS**: write a custom hook (`useXxx`) or a shared component
- Shared helpers live in a dedicated location:
  - Backend: `apps/core/utils.py`, `apps/core/mixins.py`, `apps/core/exceptions.py`
  - Frontend: `src/utils/`, `src/hooks/`, `src/components/common/`

---

## 3. Code Formatting

### Python / Django
- Follow **PEP 8** strictly.
- Max line length: **88 characters** (Black-compatible).
- Use **Black** for formatting and **isort** for import ordering.
- Group imports: stdlib → third-party → local, separated by blank lines.
- Use type hints on all function signatures.
- No bare `except:` — always catch specific exceptions.

### JavaScript / React
- Follow **Prettier** defaults.
- Use **ES2022+** syntax; prefer `const`, arrow functions, optional chaining.
- Use named exports (avoid `export default` except for pages/routes).
- Prop types via **TypeScript** interfaces, not PropTypes.

---

## 4. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Python variables/functions | `snake_case` | `get_user_profile` |
| Python classes | `PascalCase` | `UserProfile` |
| Django models | singular `PascalCase` | `Order`, `Product` |
| Django URL names | `kebab-case` | `user-profile-detail` |
| React components | `PascalCase` | `ProductCard` |
| React hooks | `camelCase` prefixed `use` | `useCartItems` |
| React files | `PascalCase.tsx` for components | `ProductCard.tsx` |
| CSS / MUI `sx` prop | object style only; no inline `style=` except dynamic values | |

---

## 5. Function & Component Design

- **One responsibility per function/component.**
- Functions longer than ~30 lines are a signal to extract helpers.
- React components longer than ~80 lines are a signal to extract sub-components.
- Avoid deeply nested conditionals — use early returns (guard clauses).
- No magic numbers/strings — define constants in a `constants.py` or `constants.ts` file.

---

## 6. API & Serializer Rules (Django)

- Every API view must have an explicit `permission_classes` declaration — no silent defaults.
- Serializers must validate data explicitly; never trust raw `request.data` directly.
- Use `SerializerMethodField` sparingly — prefer computed model properties where possible.
- Group related endpoints under a `ViewSet` when CRUD is involved.
- All responses must use the shared envelope: `{ success, message, data }` via `SuccessResponseMixin`.
- Raise domain errors using `AppError(message, status_code)` — the global `custom_exception_handler` in `apps/core/exceptions.py` catches it; never return raw `Response(status=...)` for error cases in view logic.
- Wrap every async-capable view utility with the project's `asyncHandler` equivalent — for sync DRF views this means always using `raise_exception=True` on serializers instead of manual `if not valid` branching.

---

## 7. Security Rules

- **Never** commit secrets, API keys, or passwords. Use `.env` and `python-decouple`.
- `.env` is always in `.gitignore`.
- CORS must list only the specific allowed origins — never `CORS_ALLOW_ALL_ORIGINS = True` in production.
- JWT secret key must come from environment variables only.
- Always use `get_object_or_404` (or equivalent) — never let `DoesNotExist` bubble uncaught to the client.

---

## 8. Comments

- Write comments **only when the WHY is non-obvious** (a hidden constraint, a workaround, a subtle invariant).
- Do **not** comment on what the code does — well-named identifiers do that.
- No multi-line comment blocks; one short line max.

---

## 9. Backend Testing Rules

**Package stack (fixed — do not swap these out):**
| Package | Role |
|---|---|
| `pytest` | Test runner |
| `pytest-django` | Django integration (DB access, client, settings) |
| `factory-boy` | Model factories — never build test data by hand |
| `pytest-cov` | Coverage reporting in CI |

**Rules:**
- Every new API endpoint **must** have: one happy-path test, one auth/permission test, and at least one validation/error-path test.
- Tests live in `apps/<app>/tests/` — one file per view group (e.g. `test_auth_api.py`, `test_user_api.py`).
- **Never** use `User.objects.create()` in tests — always go through a factory (`UserFactory`).
- Factories live in `apps/<app>/tests/factories.py` — one factories file per app.
- **No mocking of the database** in integration tests — tests run against a real PostgreSQL instance (see CI config).
- Use `@pytest.mark.django_db` on every test class/function that touches the DB.
- Use `APIClient.force_authenticate(user=...)` for authenticated endpoints — do not manually construct JWT headers in tests.
- Test file naming: `test_<resource>_api.py` for API tests, `test_<model>.py` for model unit tests.

**Example factory pattern (follow this exactly):**
```python
# apps/users/tests/factories.py
import factory
from apps.users.models import User

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    password = factory.PostGenerationMethodCall("set_password", "TestPass123!")
    is_active = True
```

---

## 10. React / Frontend Rules

**UI library (fixed): Material UI v6 + TypeScript — do not use raw HTML elements where an MUI component exists.**

### Component typing rules (strictly enforced)

- **Components with props** — declare a named `interface` and annotate with `FC<InterfaceName>`. Never use inline prop types.
  ```tsx
  import { FC } from "react";

  interface ProductCardProps {
    title: string;
    price: number;
  }

  export const ProductCard: FC<ProductCardProps> = ({ title, price }) => {
    // ...
  };
  ```

- **Components with no props** — use a plain arrow function. Do **not** annotate with bare `FC` (it adds an implicit `children` prop and obscures intent).
  ```tsx
  export const LoadingSpinner = () => {
    // ...
  };
  ```

- Interface names must match the component name + `Props` suffix: `ButtonProps`, `CartItemProps`, etc.
- When a component wraps an MUI component and adds no new props, use `type AppXxxProps = MuiXxxProps` (not `interface extends`) — MUI uses complex generics that TypeScript cannot extend via `interface`.
- Never use `React.FC` — always import `FC` as a type-only import: `import type { FC } from "react"`.
- MUI prop types (`ButtonProps`, `TextFieldProps`, etc.) are type-only — always import them with `import type`.

### Component rules
- Use MUI components as the primary building blocks: `Box`, `Stack`, `Typography`, `Button`, `TextField`, `Card`, etc.
- Wrap MUI primitives in thin project-specific components when adding shared defaults (see `AppButton`, `AppTextField`).
- Never repeat MUI `sx` prop logic across components — extract repeated styles into a shared `sx` object or a wrapper component.
- Pages are the only files allowed to use `export default`. Always use an arrow function with `export default` at the bottom — never `export default function`:
  ```tsx
  // correct
  const ProductPage = () => {
    return <Box>...</Box>;
  };

  export default ProductPage;

  // wrong
  export default function ProductPage() { ... }
  ```

### Hook rules
- API calls in components must go through `useApi(apiFn)` — never call `axios` directly from a component.
- Global state (auth, cart, etc.) lives in Zustand stores under `src/store/`.
- Local UI state (form fields, modal open, etc.) uses `useState` inside the component.
- Side effects that need cleanup use `useEffect` with a return function.

### File & folder rules
- One component per file. File name = component name (`ProductCard.tsx` exports `ProductCard`).
- Pages go in `src/pages/`, shared components in `src/components/common/`, feature components in `src/components/<feature>/`.
- API functions go in `src/api/<resource>Api.ts` — one file per backend resource.
- All route paths are constants in `src/constants/index.ts` (the `ROUTES` object) — never hardcode strings in `<Link>` or `navigate()`.
- **All page components must be lazy-loaded** via `React.lazy()` in `AppRoutes.tsx`. Never import a page component directly at the top of the routes file.
  ```tsx
  // correct
  const ProductPage = lazy(() => import("@/pages/ProductPage"));

  // wrong — blocks the initial bundle
  import ProductPage from "@/pages/ProductPage";
  ```

### Form rules
- Use controlled inputs (`value` + `onChange`) — no uncontrolled refs for forms.
- Show field-level validation errors using the MUI `error` and `helperText` props on `AppTextField`.
- Disable the submit button (and show a spinner) while a request is in flight.
- Display API-level errors using the shared `AlertMessage` component above the form.

### ESLint rules (enforced in CI)
These rules are active in `.eslintrc` — do not disable them with inline comments:
- `no-console` — no `console.log` / `console.error` in committed code; use a logger or remove before committing.
- `@typescript-eslint/consistent-type-imports` — always use `import type { Foo }` for type-only imports.
- `@typescript-eslint/no-unused-vars` — no unused variables or imports; remove them, do not prefix with `_` to suppress.
- `react-hooks/rules-of-hooks` — hooks must only be called at the top level of a function component or custom hook.
- `react-hooks/exhaustive-deps` — all `useEffect` / `useCallback` dependencies must be declared.

---

## 11. Documentation Rule

**Every new feature must be documented in `DOCUMENT.md` before the work is considered done.**

- When adding a backend endpoint: add a row to the API table with method, path, auth, request body, and response shape.
- When adding a frontend page or flow: add the route, description, and any key components to the Frontend Routes section.
- When completing a phase: add a Phase summary block with what was built and which files were created or changed.
- Keep `DOCUMENT.md` as the single source of truth for the project's feature set and API contract — it must always reflect the current state of the codebase.

---

## 12. Git & PR Rules

- Commit messages: `<type>(<scope>): <short summary>` — e.g. `feat(users): add JWT refresh endpoint`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- One PR per feature/fix; keep PRs small and reviewable.
- Never force-push to `main` or `develop`.

---

## Project Structure Reference

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py        # shared settings
│   │   ├── development.py # dev overrides
│   │   └── production.py  # prod overrides
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── core/              # shared utilities, base classes, exceptions
│   ├── users/             # user model, profile, password change
│   └── authentication/    # JWT login/logout/refresh views
├── manage.py
├── requirements.txt
└── .env

frontend/
├── src/
│   ├── api/               # one file per backend resource
│   ├── components/
│   │   └── common/        # shared MUI wrapper components
│   ├── constants/         # ROUTES, theme, TOKEN_KEYS
│   ├── hooks/             # useApi, useAuth, and feature hooks
│   ├── pages/             # one file per route
│   ├── routes/            # AppRoutes, ProtectedRoute
│   ├── store/             # Zustand stores
│   ├── types/             # shared TypeScript interfaces
│   └── utils/             # pure helper functions
└── ...config files
```
