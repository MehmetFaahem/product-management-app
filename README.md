## BiteX Products

A modern Next.js application for browsing, creating, editing, and deleting products with a clean, responsive UI. Authentication is email-based and the app persists your session locally. Product data and categories are fetched from a provided REST API.

### Tech stack

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Redux Toolkit + RTK Query** (state management, data fetching, cache invalidation)
- **Redux Persist** (auth/session persistence)
- **React Hook Form + Zod** (forms and validation)
- **Tailwind CSS v4** (utility-first styling) with custom component classes
- **Lucide Icons**

### Features

- **Auth**: simple email login, token persisted in `localStorage`
- **Products**:
  - List with search, category filter, price range filter, sorting, and pagination
  - Create new product with validation and image previews
  - View product detail with image gallery and price formatting
  - Edit product
  - Delete product (with confirmation), with optimistic UI for lists
- **Categories**: loaded for filtering and selection in forms
- **Responsive UI**: desktop and mobile navigation (with a mobile drawer)
- **Accessibility niceties**: keyboard shortcut `/` to focus search

## Data fetching and caching

- RTK Query handles requests, caching, and cache invalidation via tags:
  - `Products` (LIST, SEARCH) and `Product` (by id)
  - `Categories` (LIST, SEARCH)
- Mutations invalidate relevant tags to keep UI in sync without manual refetching.

## Styling

- Tailwind CSS v4 utilities power layout and typography.
- Custom component classes (e.g., `btn`, `card`, `input`, `label`, etc.) are defined in `app/globals.css`.

## Environment & persistence

- Redux Persist stores auth state under `persist:root` in `localStorage`.
- If you ever get into a bad state, logging out clears persisted data. You can also manually remove `persist:root` from the browser's storage.

## Getting started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts Next.js with Turbopack on `http://localhost:3000`.

### Build

```bash
npm run build
```

### Start (production)

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## API configuration

The API base URL is currently hardcoded in `services/api.ts`:

```ts
const BASE_URL = "https://api.bitechx.com";
```

To point the app to a different backend, change `BASE_URL` and restart the dev server. If you prefer environment variables, you can refactor to read from `process.env.NEXT_PUBLIC_API_URL` and add it to an `.env.local` file.

## Authentication flow

- Go to `/login` and submit a valid email.
- On success, the backend returns `{ token }` which is stored in Redux state and persisted to `localStorage` via Redux Persist.
- Authenticated product/category requests include `Authorization: Bearer <token>`.
- Logout via the header menu clears Redux state, RTK Query cache, and removes persisted data.

## Product flows

- **Browse**: `/products` shows a grid with search, filters, sorting, and pagination.
- **Create**: `/products/new` uses `ProductForm` with Zod validation, then navigates to the created product page.
- **Detail**: `/products/[slug]` shows images, category, price and actions (Edit/Delete).
- **Edit**: `/products/[slug]/edit` loads the existing data into `ProductForm`.
- **Delete**: from detail page or list modal; cache is invalidated to refresh lists.

## Keyboard shortcuts

- `/` focuses the search input on the products page.

## Scripts reference

Defined in `package.json`:

- `dev`: `next dev --turbopack`
- `build`: `next build --turbopack`
- `start`: `next start`
- `lint`: `eslint`

## Project structure

```
app/
  layout.tsx            # Root layout, providers wrapper
  page.tsx              # Homepage (marketing + entry to products)
  login/page.tsx        # Email login
  products/
    page.tsx            # Products list
    new/page.tsx        # Create product
    [slug]/page.tsx     # Product detail
    [slug]/edit/page.tsx# Edit product
components/
  Header.tsx            # Top nav (desktop + mobile)
  Products.tsx          # Products list with filters, search, pagination
  ProductCard.tsx       # Product card for grid display
  ProductForm.tsx       # Create/Edit form with validation and previews
  Providers.tsx         # Redux, PersistGate, QueryClient providers
features/
  auth/authSlice.ts     # Auth state, actions, logout thunk
lib/
  store.ts              # Store setup, types, hooks
services/
  api.ts                # RTK Query API slice and endpoints
public/                 # Static assets
```

## Notes

- The app includes `@tanstack/react-query` provider for future use, but current data fetching is via RTK Query.
- Image elements intentionally use standard `img` tags to keep the UX simple.

## Troubleshooting

- **Cannot see products after login**: Ensure the backend at the configured `BASE_URL` is reachable and returns data for your token.
- **Unauthorized (401)**: Your token may be invalid or expired. Log out and sign in again.
- **Stale data after mutations**: The app uses tag invalidation; if you changed the API behavior, ensure endpoints still return ids used by tags.

## License

This repository is for assessment/demo purposes.
