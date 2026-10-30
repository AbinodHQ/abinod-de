<p align="center">
  <img src="assets/abinod-mark.svg" alt="Abinod logo" width="96" />
</p>

# Abinod

Official German website for Abinod: software products, focused engineering services, and professional digital and screen printing.

The product portfolio includes **Ambiten** (runtime infrastructure), **VeriNodo** (customer feedback and testimonials), and **PureConsent** (website consent management).

## Live websites

- English: https://www.abinod.com/ — repository `abinod`
- German: https://www.abinod.de/ — repository `abinod-de`

These are separate static sites. Maintain corresponding routes, localized copy, canonical URLs and language links in both repositories; do not overwrite German consent integration with the English implementation.

## Pages and features

| Route | Content |
| --- | --- |
| / | Company overview, products, services, testimonials and latest articles |
| /products/ | Ambiten, VeriNodo and PureConsent |
| /ecosystem/ | Product portfolio and shared foundation |
| /solutions/ | Technology and engineering services |
| /printing/ | Digital and screen printing, artwork carousel, service cards and project guidance |
| /about/, /founder/, /mission/, /brand-essence/ | Company, founder and principles |
| /blog/ | Article grid; product releases and engineering stories, including the PureConsent integration |
| /contact/ | Enquiry form, printing requests and enterprise contact anchor |
| /documentation/ | Documentation hub for the three products |
| /docs/ | Ambiten documentation entry point |
| /privacy/ | Privacy policy |

Shared features include grouped desktop dropdown navigation, mobile menus, route-preserving language links, light/dark themes, a responsive four-group corporate footer, article author details and sharing controls, social metadata, and static-asset caching. Printing artwork is served from optimized WebP assets.

## Maintaining the UI

- `styles.css`: base theme, page layouts, product cards and blog styles.
- `assets/navigation.css` / `navigation.js`: shared dropdown navigation and service layouts; German responsive text rules live here.
- `assets/footer.css`: corporate footer used across 19 public pages per site.
- `assets/printing.css` / `printing.js`: printing cards and accessible carousel.
- `assets/language-switcher.js` / `language-switcher.css`: English/German route switching.
- Page HTML contains the header/footer markup. Apply shared markup changes to all public pages in both repositories.

When adding a page, provide matching localized routes, navigation/footer links as appropriate, canonical and alternate-language metadata, and a language-switcher route. Check headings, long German words, buttons and cards at 320, 360, 390 and 768px, plus desktop. Test both themes and keyboard navigation. Do not mask layout problems by hiding page overflow.

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

Node.js 20 or newer is required. Set `PORT` to run both repositories simultaneously. The local Express contact endpoint deliberately returns HTTP 503 with an email fallback; SMTP delivery is handled by the production Vercel Function.

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
Product support for Ambiten, VeriNodo and PureConsent: [support@abinod.com](mailto:support@abinod.com).

## Cookies And Consent

The German site loads PureConsent from https://com.pureconsent.de/consent.js with website ID 20169897-e478-431c-a1e3-1e2fff2826bb on every public page. The production installation uses the verified www.abinod.de origin. Any additional origin needs its own authorization in PureConsent. The configuration must use https://www.abinod.de/privacy/.

The former banner functions remain in assets/site.js and their styles remain in styles.css, but the initialization call is disabled. The old abinod_cookie_consent cookie is not migrated into PureConsent: visitors make a fresh choice. Rollback requires removing the PureConsent script tags and restoring runWhenIdle(openCookieConsent, 900).

No optional analytics scripts are currently installed. The external VeriNodo testimonials loader is gated behind the marketing category. Future optional scripts must use type="text/plain" and data-consent="analytics" or data-consent="marketing"; external scripts use data-src instead of src. Do not gate the site's essential navigation or contact form. Already-running third-party services require provider-specific cleanup on withdrawal.

PureConsent stores choices in first-party localStorage for 180 days and submits consent receipts and separate page-view events. Its persistent privacy button reopens settings. The widget does not work on an unregistered localhost or preview origin; do not bypass origin verification to test it. Verify rejection, acceptance and withdrawal on the authorized production domain after integration changes. The .com site requires its own website ID and is unchanged.

The German site uses PureConsent; the English site retains its separate legacy consent integration. Consent configuration is origin-specific.

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
https://www.abinod.de/api/health
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
├── documentation/
├── docs/
├── ecosystem/
├── founder/
├── mission/
├── products/
├── solutions/
├── printing/
├── privacy/
├── api/
├── sw.js
├── vercel.json
├── server.js
├── styles.css
└── package.json
```

## Brand Principle

Strong foundations create stronger systems.

## Brand assets and printing carousel

The supplied logo, favicons and home-screen icons live in `assets/abinod-assets/`. Shared logo references use `assets/abinod-mark.svg`; public pages link the SVG/PNG favicons, Apple touch icon and `site.webmanifest`. Update the service-worker cache version when replacing cached brand assets.

The printing carousel advances every 4.5 seconds and loops from the last slide to the first. It pauses on hover, keyboard focus, hidden tabs and when offscreen. Visitors can pause it explicitly; reduced-motion preferences disable autoplay. Arrow buttons, dot controls and keyboard navigation remain available.

## Homepage articles and legal notice

`/impressum/` contains the provider information and is linked from navigation and the footer. Keep legal details synchronized across both language repositories.

The homepage shows the two newest published cards from `/blog/`, sorted by `time[datetime]` (ISO `YYYY-MM-DD`). Add each new article to the localized blog index with its publication date. `assets/latest-posts.js` refreshes the homepage from that index, excludes future-dated entries, and resolves article and image paths. The embedded cards remain available if JavaScript or the network is unavailable. Update those fallback cards when publishing.
