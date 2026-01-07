# Adobe Commerce on Edge Delivery Services (EDS) Project

## Architecture Overview

This is an **Adobe Experience Manager (AEM) Edge Delivery Services** project integrated with **Adobe Commerce** using the Drop-ins architecture. Content is authored in document-based tools and served via EDS while commerce functionality comes from pre-built Drop-in components.

- **Content Layer**: Documents from `https://content.da.live/developer-arman/vuseuk/` (see [fstab.yaml](fstab.yaml))
- **Commerce Backend**: Adobe Commerce GraphQL endpoints configured in [config.json](config.json)
- **Drop-ins**: Pre-built commerce components from `@dropins/*` packages installed in `scripts/__dropins__/`

## Critical Workflow: Drop-in Dependencies

**IMPORTANT**: Drop-in packages live in `node_modules/` but must be **manually copied** to `scripts/__dropins__/` for EDS to serve them:

```bash
npm install @dropins/storefront-cart@2.0.0  # Updates node_modules
npm run postinstall                          # REQUIRED: Copies to scripts/__dropins__
```

The `postinstall` script (via [build.mjs](build.mjs) and [postinstall.js](postinstall.js)) copies Drop-in assets from `node_modules/` to `scripts/__dropins__/`. This is **NOT automatic** when installing specific packages - you must explicitly run `npm run postinstall` or `npm run install:dropins`.

## Project Structure Patterns

### Blocks (Components)
All blocks follow this structure:
```
blocks/[block-name]/
  [block-name].js   # export default async function decorate(block) {}
  [block-name].css
  README.md         # Block configuration docs
```

**Standard blocks** ([cards/](blocks/cards), [carousel/](blocks/carousel), [hero/](blocks/hero)): Built with vanilla JS, decorated via `decorate(block)` function.

**Commerce blocks** ([commerce-cart/](blocks/commerce-cart), [product-details/](blocks/product-details)): Import Drop-in containers and use Preact rendering:
```javascript
import { render as provider } from '@dropins/storefront-cart/render.js';
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';
// Configuration via readBlockConfig() from block tables
const config = readBlockConfig(block);
```

### Scripts Architecture

- **[scripts/aem.js](scripts/aem.js)**: Core EDS utilities (`decorateBlocks`, `loadCSS`, `buildBlock`, etc.)
- **[scripts/scripts.js](scripts/scripts.js)**: Main entry point defining page lifecycle (`loadEager` → `loadLazy` → `loadDelayed`)
- **[scripts/commerce.js](scripts/commerce.js)**: Commerce-specific utilities, Drop-in initialization, GraphQL endpoint setup
- **[scripts/initializers/index.js](scripts/initializers/index.js)**: Drop-in configuration, auth headers, event bus setup

### Page Lifecycle
```javascript
// scripts/scripts.js
loadEager()  → initializeCommerce() → decorateMain() → loadCommerceEager()
loadLazy()   → loadHeader/Footer() → loadCommerceLazy()
loadDelayed() → After 3s, import delayed.js
```

## Commerce Integration Patterns

### GraphQL Endpoints
Two separate instances configured in [initializeCommerce()](scripts/commerce.js):
- **CORE_FETCH_GRAPHQL**: Core Commerce endpoint (`commerce-core-endpoint`)
- **CS_FETCH_GRAPHQL**: Catalog Service endpoint (`commerce-endpoint`) with special headers

### Drop-in Customization
[build.mjs](build.mjs) uses `@dropins/build-tools` to skip unsupported GraphQL fragments:
```javascript
overrideGQLOperations([{
  npm: '@dropins/storefront-cart',
  skipFragments: ['DOWNLOADABLE_CART_ITEMS_FRAGMENT'], // ACCS doesn't support downloadable items
}]);
```

### Authentication Flow
- User token stored in cookie `auth_dropin_user_token` 
- [scripts/initializers/index.js](scripts/initializers/index.js) listens to `auth/authenticated` event → sets Authorization header
- Cart ID persisted to `sessionStorage.DROPINS_CART_ID`

### Event Bus Pattern
Drop-ins communicate via `@dropins/tools/event-bus`:
```javascript
import { events } from '@dropins/tools/event-bus.js';
events.on('auth/authenticated', setAuthHeaders, { eager: true });
```

## Content Routing Conventions

- **Customer pages**: `/customer/*` ([commerce.js](scripts/commerce.js) defines constants like `CUSTOMER_PATH`, `CUSTOMER_ORDERS_PATH`)
- **Guest order tracking**: `/order-status`, `/order-details`
- **Products**: Metadata-driven via bulk metadata (see [tools/pdp-metadata/](tools/pdp-metadata/))
- **Fragments**: Links to `/fragments/*` auto-converted to inline content via [blocks/fragment/](blocks/fragment)

## Link Localization
All internal links are automatically localized via `decorateLinks()` in [commerce.js](scripts/commerce.js) based on `getRootPath()`. Add `#nolocal` hash to skip: `<a href="/page#nolocal">`.

## Testing

Cypress E2E tests in [cypress/](cypress/) directory:
```bash
cd cypress && npm install
npm run cypress:open    # PaaS environment (default)
npm run cypress:saas:open  # SaaS environment
```

Tests use environment-specific configs ([cypress.paas.config.js](cypress/cypress.paas.config.js), [cypress.saas.config.js](cypress/cypress.saas.config.js)) extending [cypress.base.config.js](cypress/cypress.base.config.js). Tag tests with `{ tags: '@skipSaas' }` or `{ tags: '@skipPaas' }` for environment-specific skips.

## Local Development

```bash
npm install          # Installs deps and runs postinstall automatically
npm start            # Runs AEM CLI dev server (aem up) on http://localhost:3000
npm run lint         # ESLint + Stylelint
npm run lint:fix     # Auto-fix linting issues
```

## Key Files Reference

- [config.json](config.json): GraphQL endpoints, store codes, API keys, analytics config
- [fstab.yaml](fstab.yaml): Content source mountpoint
- [head.html](head.html): Metadata template for all pages
- [default-site.json](default-site.json): Sitemap configuration
- [404.html](404.html), [418.html](418.html): Error page templates
