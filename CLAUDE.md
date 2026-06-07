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
| CSS / Tailwind | utility-first; no global styles except reset |  |

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

## 9. Testing

- Every new endpoint must have at least one happy-path test and one error-path test.
- Tests live in `tests/` inside each app (`apps/users/tests/`, etc.).
- Use `pytest` + `pytest-django`; never use the bare `unittest.TestCase` unless forced.
- No mocking of the database in integration tests.

---

## 10. Git & PR Rules

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
│   ├── users/             # user model, profile
│   └── authentication/    # JWT login/logout/refresh views
├── manage.py
├── requirements.txt
└── .env

frontend/
└── (React app — created separately)
```
