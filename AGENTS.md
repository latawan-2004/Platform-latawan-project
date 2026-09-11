# Latawan — Agentic Build Prompt (Execution-Ready)

You are a senior full-stack engineer with terminal, file-system, and (if available)
browser-preview access. Build Latawan, a travel-destination management platform,
in the current empty/near-empty project directory.

Read this entire file before writing any code. Then follow the protocol below exactly.

-   0. Operating Protocol (read first)

Plan before building. Before Phase 1, write out a short task list / implementation plan (if your environment supports a plan or task-list artifact, use it). Check items off as you go instead of narrating progress in prose.

Work phase by phase, in order. Do not start Phase N+1 until Phase N's "Definition of Done" is met and verified with a real command (not assumed).

Verify, don't assert. After each phase, run the actual verification command(s) listed for that phase. If a browser-preview tool is available, load the relevant page and visually confirm it renders before marking the phase done. Never say a feature is "complete" unless you just watched it work.

Inspect before you create. Before scaffolding, check whether a Laravel project already exists in this directory. Don't run the installer over an existing app, don't duplicate migrations/models/routes that already exist — extend them instead.

Stop and ask only when genuinely blocked (e.g. a required CLI tool is missing, or two reasonable architectural choices materially conflict). Otherwise make the sensible default choice and keep going.

End with a handoff report in the exact format in Phase 11.

-   1. Prerequisites Check

Run and record the output of:

php -v
composer -V
node -v
npm -v
php -m | grep -i sqlite

If any are missing or below the required minimum (PHP 8.3+, Node 18+), stop and tell
the user rather than guessing around it — this app cannot be scaffolded without them.

-   2. Phase 1 — Project Scaffold

Goal: a running Laravel app with the official Inertia + React + TypeScript starter
kit installed.

If no Laravel project exists yet, use the current Laravel installer to scaffold with the React + TypeScript + Inertia starter kit. Run laravel new --help (or composer create-project laravel/laravel followed by php artisan install:api/starter-kit install, whichever your installed Laravel version uses) to confirm the exact current flags — don't hard-code a flag from memory, CLI syntax changes between Laravel releases.

Confirm SQLite is the configured DB connection in .env (DB_CONNECTION=sqlite), and that database/database.sqlite exists (create it if not: touch database/database.sqlite).

Install dependencies: composer install, npm install.

Run the dev servers (composer run dev or equivalent) and confirm the default welcome/auth page loads in a browser preview with no console or terminal errors.

Definition of Done / Verify:

php artisan --version succeeds

App boots and renders in browser preview with zero console errors

git status (if git is initialized) shows a clean scaffold — commit this checkpoint

-   3. Phase 2 — Database Layer

Goal: destinations table, model, factory, seeder.

Migration — table destinations:

column type notes

name

string

required

location

string

required

description

text

required

category

string

required, see enum below

entrance_fee

decimal(10,2)

default 0

opening_hours

string, nullable

contact

string, nullable

latitude

decimal(10,7), nullable

longitude

decimal(10,7), nullable

difficulty

string, nullable

see enum below

image

string, nullable

storage path only, never binary

status

string

default draft, see enum below

timestamps

Enums to enforce in validation (not necessarily DB enums — Laravel in: rule is fine):

category: Waterfall, Mountain & Peak, Beach & Coast, Cave & Underground, Forest & Trail, River & Spring, Lake, Island & Sandbar, Heritage & Cultural, Camping & Eco-Park

difficulty: Easy, Moderate, Hard, Challenging

status: draft, published, archived

Create migration, Destination model (with $fillable/$guarded, casts for entrance_fee to decimal, latitude/longitude to float), and a DestinationFactory.

Create DestinationSeeder with 15 realistic Philippine destinations — real place names, plausible locations, varied categories/difficulty/status/fees, no external image URLs required (leave image null for seeded rows; the upload flow is tested manually).

Definition of Done / Verify:

php artisan migrate:fresh --seed
php artisan tinker --execute="echo App\Models\Destination::count();"

Must print 15 (or your chosen seed count) with no errors.

-   4. Phase 3 — Backend: Policy, Requests, Controller, Routes

php artisan make:policy DestinationPolicy --model=Destination — gate create, update, delete, and custom publish/archive abilities to authenticated admin users. Register it.

Form Requests: StoreDestinationRequest, UpdateDestinationRequest with the validation rules in the Appendix. Never trust client input — re-validate everything server-side even though the frontend also validates.

DestinationController (resource): index, create, store, show, edit, update, destroy.

index: server-side search (name, location, category), filter (category, difficulty, status), sort (newest, oldest, name_asc, name_desc, fee_asc, fee_desc), and pagination. Do this all in the Eloquent query — never fetch everything and filter in JS.

Public visitors only ever see status = published rows; admins see all.

store/update: handle image upload via Storage::disk('public'), path destinations/. On update with a new image, delete the old file after the new one is stored successfully. On destroy, delete the image file then the row.

Routes: Route::resource('destinations', DestinationController::class), admin-only actions behind auth + policy middleware; add lightweight POST destinations/{destination}/publish and /archive endpoints.

Run php artisan storage:link.

Definition of Done / Verify:

php artisan route:list --path=destinations

All 7 resource routes plus publish/archive exist. Manually hit store/update/destroy
via Tinker or a quick test and confirm DB + storage/app/public/destinations behave as
described.

-   5. Phase 4 — Auth Wiring

The starter kit ships auth scaffolding already — reuse it, don't rebuild it.

Confirm register/login/logout work end-to-end (browser preview).

Confirm an unauthenticated visitor can view /destinations (published only) and a destination's show page, but is redirected when hitting /destinations/create, /destinations/{id}/edit, or any mutating route.

Confirm an authenticated user without policy permission still gets a 403 (don't rely on "logged in = admin" — wire the policy check for real).

Definition of Done / Verify: manually walk both the logged-out and logged-in path in
browser preview; note any 403/redirect behavior actually observed.

-   6. Phase 5 — Shared Types & UI Primitives

resources/js/types/destination.ts — the Destination interface (see Appendix). Use this type everywhere; avoid any.

resources/js/components/ui/: Button.tsx, Modal.tsx, Input.tsx, Select.tsx, Textarea.tsx — small, reusable, typed, no duplicated styling logic.

Verify: npx tsc --noEmit passes with zero errors before moving on.

-   7. Phase 6 — Public Explorer Pages

resources/js/pages/destinations/index.tsx and show.tsx.

Index: search bar, category/difficulty filters, sort dropdown, paginated card grid (3–4 cols desktop / 2 tablet / 1 mobile). Card shows image, name, location, category + difficulty badges, entrance fee, "View Details →". Empty state when no results match.

Show: large image, full description, all fields from the Appendix, coordinates with a "navigate" link (e.g. to Google Maps using lat/lng), created/updated dates.

All search/filter/sort state should live in the URL (Inertia router.get with query params) so it's shareable and server-driven — not client-side filtering of a full list.

Verify: in browser preview, search for a term, apply a filter, change sort, and page
through results — confirm the network request is a real server round-trip
(?search=&category=&difficulty=&sort=&page=), not client-side array filtering.

-   8. Phase 7 — Admin CRUD Pages

create.tsx, edit.tsx, reusable DestinationForm.tsx.

All fields from the Appendix; client-side validation messages mirror server rules but never replace them.

Image upload: accept jpg/jpeg/png/webp, show a preview before submit, submit with forceFormData: true.

Edit page preloads existing values and existing image; uploading a new image replaces it (old file deleted server-side per Phase 3); leaving it blank keeps the existing image.

Delete: confirmation modal before the destructive router.delete call.

Flash messages after create/update/delete/publish/archive, rendered as toasts/banners.

Verify: manually create a destination with an image, edit it and replace the image
(confirm the old file is gone from storage/app/public/destinations), then delete it
(confirm both the row and file are gone). Check for a confirmation dialog before delete.

-   9. Phase 8 — Dashboard

pages/dashboard.tsx, components/dashboard/StatCard.tsx,
components/dashboard/RecentDestinations.tsx.

Stats: Total Destinations, Published, Draft, Archived, Total Categories in use, Average
Entrance Fee, "Recently Added" list (thumbnail, name, location, category, status, created
date). Compute these server-side in the controller, not in the browser.

Verify: seed data renders correct counts — spot-check one stat against a manual
php artisan tinker query.

-   10. Phase 9 — Design Pass

Apply a nature/travel aesthetic: deep emerald, forest green, warm stone, off-white, soft
gray, muted gold accents. Large type, generous whitespace, rounded cards, soft shadows,
smooth hover states. This should not look like a generic admin template. Do this pass
after functionality works, not before — don't polish CSS on broken data flow.

Verify: if a browser tool is available, capture a screenshot of the index, show, and
dashboard pages at desktop and mobile widths.

-   11. Phase 10 — Final QA & Handoff Report

Run, in order:

npx tsc --noEmit
php artisan route:list
php artisan test # if any tests exist

Then manually walk the full testing checklist below. Only after this, produce a handoff
report with these exact sections:

Files created (list)

Files modified (list)

Database changes (migrations applied)

Routes created (from route:list)

Features implemented vs not implemented / partial — be honest, don't claim something works if you didn't just verify it

Commands to run the project (see below)

Testing checklist results — pass/fail per item, not just a copy of the checklist

Known issues / follow-ups

Testing checklist

Auth: login / logout / protected routes / unauthorized access blocked.
Create: page loads / validation fires / image upload + preview work / DB row created.
Read: index / search / filters / sort / pagination / show page all correct.
Update: edit preloads values + image / new image replaces + deletes old / DB updates.
Delete: confirmation shown / row + image deleted / redirect + flash message shown.
UI: responsive at mobile/tablet/desktop / no console errors / no TS errors / empty and
loading states present.

Appendix — Domain Reference

Destination type

export interface Destination {
id: number;
name: string;
location: string;
description: string;
category: string;
entrance_fee: number;
opening_hours: string | null;
contact: string | null;
latitude: number | null;
longitude: number | null;
difficulty: string | null;
image: string | null;
status: 'draft' | 'published' | 'archived';
created_at: string;
updated_at: string;
}

Validation rules

name required|string|max:255
location required|string|max:255
description required|string
category required|in:<the 10 categories>
entrance_fee numeric|min:0
opening_hours nullable|string
contact nullable|string
latitude nullable|numeric|between:-90,90
longitude nullable|numeric|between:-180,180
difficulty nullable|in:Easy,Moderate,Hard,Challenging
image nullable|image|mimes:jpg,jpeg,png,webp|max:5120
status required|in:draft,published,archived

Categories: Waterfall, Mountain & Peak, Beach & Coast, Cave & Underground, Forest &
Trail, River & Spring, Lake, Island & Sandbar, Heritage & Cultural, Camping & Eco-Park

Design tokens: deep emerald, forest green, warm stone, off-white, soft gray, muted
gold accents — premium/editorial travel feel, not a generic admin dashboard.

Commands to run the project (for the human, after the agent finishes)

composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
composer run dev # or: php artisan serve + npm run dev, in two terminals

Then open the URL Vite/artisan serve prints (typically http://127.0.0.1:8000).

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application running on PHP 8.5. You are an expert with the Laravel ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:

- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Framework and package guidelines that only apply to specific paths (testing, frontend, components) also live there, under `.ai/rules/boost` — this is not just recorded decisions, it is load-bearing guidance you have not seen inline. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.
- Record durable rules with `record-rule` so the next agent or teammate inherits them instead of working them out again. Pass a `glob` (e.g. `app/Http/Controllers/**`), a short `title`, and a few-line `note`. Always use `record-rule`, never your native memory or notes tool — native memory is personal and session-scoped; only `.ai/rules` is shared with the team and persists in the repo.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
    - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== tests rules ===

# Test Enforcement

- Test every code change by adding or updating a test.
- Run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This project uses Pest. Create tests with `php artisan make:test --pest {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/pest` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.
- After the feature tests pass, ask the user to run the complete suite with `php artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
