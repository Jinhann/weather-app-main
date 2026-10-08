# Today's Weather

A responsive weather app: search any city (optionally narrowed by country), see today's conditions, and keep a persistent search history. Built with React 18, TypeScript and Vite, with light and dark themes.

## Features

- Search by **city and country** (country is optional; full names such as "Japan" and ISO codes such as "JP" both work).
- Clear, specific messages for empty input, unknown locations, a bad or missing API key, rate limiting and network failures.
- Working **Search**, **Clear**, **search again** and **delete** buttons.
- **Search history** persisted in `localStorage` (survives refresh), newest first, de-duplicated, capped at 20.
- Loading states without layout shift (spinner on a fixed-width Search button, the current weather dims only if a request takes longer than ~0.35s, and a screen-reader-only status message) and a friendly empty state.
- **Light/dark theme** switcher; defaults to the OS preference and remembers your choice.
- Responsive from 320px to large desktops; keyboard and screen reader friendly.
- Automated tests (Vitest + Testing Library), strict TypeScript, ESLint with zero warnings allowed.

## Tech stack

React 18, TypeScript (strict), Vite 6, plain CSS with custom properties, Vitest, React Testing Library, ESLint 9 (flat config). No UI library and no HTTP library: requests use `fetch` with `AbortController`.

## Prerequisites

- Node.js 20+ (developed on Node 22) and npm 10+
- A free [OpenWeather](https://home.openweathermap.org/api_keys) API key

## Setup

```bash
npm install
cp .env.example .env     # then set VITE_OPENWEATHER_API_KEY in .env
npm run dev
```

Get a key at https://home.openweathermap.org/api_keys. If a `.env` file is already present in the submitted folder, it contains a working key for reviewers and no further setup is needed. `.env` is git-ignored; only `.env.example` is meant to be committed. Because the key is bundled into client-side code by Vite, use a restricted/free key and never a secret one.

## Scripts

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the Vite dev server                        |
| `npm run build`     | Type-check, then create a production build       |
| `npm run preview`   | Serve the production build locally               |
| `npm run lint`      | ESLint (fails on any warning)                    |
| `npm run typecheck` | TypeScript type-check without emitting           |
| `npm test`          | Run all tests once                               |
| `npm run test:watch`| Run tests in watch mode                          |

## Project structure

```
src/
  types/          type-only modules: weather (SearchQuery, OpenWeatherResponse, WeatherReport),
                  history (HistoryEntry, HistoryLocation), theme (Theme)
  api/            OpenWeather client, no React: openWeather (URL, normalisation, fetch),
                  errors (WeatherApiError, message map, abort check)
  utils/          pure helpers, no React: formatDateTime, weatherIllustration, history, storage, theme
                  (isSameLocation, createId, validator), storage (readStorage / writeStorage)
  hooks/          thin React wrappers: useOpenWeather (request lifecycle), useSearchHistory
                  (reducer + persistence), useLocalStorage (persisted state / reducer)
  context/
    theme/        ThemeContext, ThemeProvider, useTheme
    weather/      WeatherContext, WeatherProvider (useReducer), useWeather
  components/     one folder per component (tsx + css)
                  connected to context: SearchForm, WeatherCard, SearchHistory
                  presentational (props only): SearchHistoryItem, WeatherIllustration, DateTime,
                  Button, TextField, StatusMessage, IconButton, Spinner, ThemeToggle, icons
  assets/         background and weather illustrations
  styles/         global.css (design tokens, themes, shared buttons)
  test/           test setup and fixtures
  App.tsx         layout only
  main.tsx        entry point: renders <App /> inside ThemeProvider and WeatherProvider
```

Tests live next to the module they cover (`*.test.ts` / `*.test.tsx`).

## Architecture and design decisions

- **Layering**: dependencies point one way: `types` → `api` / `utils` → `hooks` → `context` providers → `components`. `types/`, `api/` and `utils/` are pure and framework-free (they never import React) and are unit-tested without rendering anything. `hooks/` are thin React wrappers that add state and effects around those modules. Providers compose the hooks, and components consume the providers.
- **Types**: `types/` holds only type declarations shared across layers. The raw API shape (`OpenWeatherResponse`) is kept separate from the domain model (`WeatherReport`), so the UI never depends on the API's field names (`temp_min`, `sys.country`, ...). Component prop interfaces stay in their component files and reducer action types next to their reducer.
- **API layer**: `api/openWeather.ts` builds the URL, calls `fetch`, normalises the response and throws a `WeatherApiError` with a `kind` (not found, invalid or missing API key, rate limiting, network, unknown). `api/errors.ts` holds the single message map for user-facing text. An aborted request is not wrapped: the `AbortError` propagates untouched.
- **Provider + hooks**: `WeatherProvider` owns all weather state and composes two custom hooks. `useOpenWeather` owns the request lifecycle and `useSearchHistory` owns the persisted history. Components read state and actions through `useWeather()` (search, searchAgain, removeHistoryEntry, clearError), which throws a helpful error when used outside the provider. The context value is memoised with `useMemo` and the actions with `useCallback`, so consumers do not re-render needlessly.
- **Why reducers**: both the request state (idle, loading, success, error plus the last good report) and the history (add with de-duplication and cap, remove) are small state machines with several fields that change together. A `useReducer` with a typed discriminated-union action keeps every transition in one pure function, makes illegal combinations hard to express, and lets the history reducer be unit-tested without React.
- **Container vs presentational components**: `SearchForm`, `WeatherCard` and `SearchHistory` are connected to the weather context. Everything else (`Button`, `TextField`, `SearchHistoryItem`, `WeatherIllustration`, `DateTime`, `StatusMessage`, `IconButton`, ...) is props-only and reusable. `DateTime` renders a semantic `<time>` using `utils/formatDateTime`; `WeatherIllustration` maps the result of `utils/weatherIllustration` to the sun or cloud image.
- **`fetch` + `AbortController`**: no extra dependency. `useOpenWeather` aborts the previous request when a new search starts, so the latest search always wins, and aborts the request in flight on unmount. Aborted or superseded requests are ignored (`fetchWeather` resolves to `null`) rather than shown as errors.
- **User-facing errors**: `useOpenWeather` converts any `WeatherApiError` into an `Error` carrying the message from `api/errors`, so providers and components only ever see ready-to-show text.
- **Persistence**: `utils/storage` reads and writes JSON, validating whatever it reads (corrupt or wrongly shaped data falls back to the default) and tolerating storage errors. `useLocalStorage` (state) and `usePersistentReducer` (reducer, used by the history) wrap it in React. History is stored under a versioned key (`todays-weather:history:v1`) using the API's canonical city name and country code. A repeated location (same city + country, case-insensitive) is moved to the top with a fresh timestamp instead of being duplicated.
- **Theming**: CSS custom properties switched by `data-theme` on `<html>`; components contain no theme logic beyond `ThemeToggle`.
- **Fast refresh friendly**: each context is split into context object, provider component and consumer hook files so component files only export components, and non-component helpers live in `utils/`.

## Accessibility and responsiveness

- Visible labels, `aria-invalid`/`aria-describedby` on invalid input, `role="alert"` for errors, `role="status"` for loading, descriptive `aria-label`s on icon buttons, `aria-pressed` on the theme toggle, semantic headings, `<ol>` for history and `<time>` elements.
- Visible `:focus-visible` outlines; the spinner slows down under `prefers-reduced-motion`.
- Mobile-first behaviour below 600px: stacked inputs, full-width buttons, history time under the location, weather details beside the temperature. No horizontal scrolling down to 320px.

## Assumptions

See [ASSUMPTIONS.md](./ASSUMPTIONS.md).
