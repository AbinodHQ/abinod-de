<p align="center">
  <img src="assets/abinod-mark.svg" alt="Abinod logo" width="96" />
</p>

# Abinod

Official website for [Abinod](https://www.abinod.com/), a founder-led software company building infrastructure products for modern applications.

Abinod exists to create products that help software remain understandable as it grows. Its first product is Ambiten, a context-aware runtime for modern multi-tenant systems.

## Live Site

[https://www.abinod.com/](https://www.abinod.com/)

## What Is Included

- Company homepage
- Products page
- Ecosystem page
- About page
- Founder page
- Mission page
- Brand Essence page
- Blog and first essay
- Contact page with email-based form submission
- Ambiten documentation entry point
- Shared Open Graph image
- Mobile navigation
- Light and dark mode
- First-visit site guide
- Cookie consent banner
- Service worker for static asset caching

## Tech Stack

- Node.js
- Express
- Static HTML, CSS, and JavaScript
- Service worker
- GitHub Actions for production readiness checks
- Vercel Functions for production API routes

## Run Locally

Install dependencies:

```bash
npm install
```

Start the production server locally:

```bash
npm start
```

Start the development server with Node watch mode:

```bash
npm run dev
```

By default, the site runs at:

```text
http://localhost:3000
```

## Contact Form

The contact form posts to `/api/contact`. In production, the Vercel Function
sends the message to:

```text
contact@abinod.com
```

Messages are sent by email and are not stored in a database. If email delivery
is unavailable, the frontend shows a mailto fallback.

General enquiries and partnerships: [contact@abinod.com](mailto:contact@abinod.com).
Product support for Ambiten and VeriNodo: [support@abinod.com](mailto:support@abinod.com).

## Cookies And Consent

The German site loads PureConsent from https://com.pureconsent.de/consent.js with website ID 20169897-e478-431c-a1e3-1e2fff2826bb on every public page. Activate the www.abinod.de origin by completing its DNS verification in PureConsent before deployment. The configuration must use https://www.abinod.de/privacy/.

The former banner functions remain in assets/site.js and their styles remain in styles.css, but the initialization call is disabled. The old abinod_cookie_consent cookie is not migrated into PureConsent: visitors make a fresh choice. Rollback requires removing the PureConsent script tags and restoring runWhenIdle(openCookieConsent, 900).

No optional analytics scripts are currently installed. The external VeriNodo testimonials loader is gated behind the marketing category. Future optional scripts must use type="text/plain" and data-consent="analytics" or data-consent="marketing"; external scripts use data-src instead of src. Do not gate the site's essential navigation or contact form. Already-running third-party services require provider-specific cleanup on withdrawal.

PureConsent stores choices in first-party localStorage for 180 days and submits consent receipts and separate page-view events. Its persistent privacy button reopens settings. The widget does not work on an unregistered localhost or preview origin; do not bypass origin verification to test it. Both rejection and acceptance must be verified on the authorized production domain after activation. The .com site requires its own website ID and is unchanged.

## Service Worker

The site registers `sw.js` to cache core static assets for faster repeat visits and basic offline resilience.

## Production Workflow

The production GitHub Actions workflow lives at:

```text
.github/workflows/production.yml
```

It runs on pushes to `main` and can also be started manually from GitHub Actions.

The workflow:

- Installs dependencies with `npm ci`
- Checks JavaScript syntax
- Starts the production server
- Smoke-tests the main public routes
- Smoke-tests the local contact fallback
- Prints server logs if something fails

## Deploying On Vercel

The static website can be deployed on Vercel. The contact API and health check
live in the `api/` directory:

```text
api/contact.js
api/health.js
```

No database environment variables are required. Add these SMTP variables in the
Vercel dashboard:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
CONTACT_TO=contact@abinod.com
```

`SMTP_FROM` should usually be the same mailbox as `SMTP_USER`, or another
verified sender allowed by the SMTP provider. You can verify the deployed API
configuration at:

```text
https://www.abinod.com/api/health
```

## Open Graph

The website uses this shared Open Graph and Twitter card image:

```text
assets/og-abinod.png
```

## Project Structure

```text
.
├── about/
├── assets/
├── blog/
├── brand-essence/
├── contact/
├── docs/
├── ecosystem/
├── founder/
├── mission/
├── products/
├── server.js
├── styles.css
└── package.json
```

## Brand Principle

Strong foundations create stronger systems.
