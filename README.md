# Sé Rafi

Mockup storefront for **Sé Rafi**, a fine jewelry brand built around stackable rings.

Plain HTML, CSS and JS. No build step. Hosted on GitHub Pages. Runs as a demo store out of the box and switches to a live Shopify store when you add your Storefront API details.

## Pages
Each page is a folder with its own `index.html`, giving clean URLs (`/shop/`). Links between pages are relative, so the site works on a custom domain and on the `github.io` project URL.

| File | URL | Page |
| --- | --- | --- |
| `index.html` | `/` | Home: ring-stack hero, categories, bestsellers, ready-made stacks |
| `shop/index.html` | `/shop/` | All products, filter by category (`?category=rings`), metal (`?metal=rose`) and sort |
| `product/index.html` | `/product/?handle=dew-solitaire` | Product page: metal and size selection, add to bag |
| `stack/index.html` | `/stack/` | Stack builder: up to 6 rings, reorder, set metals, add the whole stack in one size |
| `about/index.html` | `/about/` | Our story |
| `care/index.html` | `/care/` | Ring size chart (`#sizing`), care (`#care`), shipping and returns (`#shipping`) |
| `contact/index.html` | `/contact/` | Contact form |
| `privacy/index.html` | `/privacy/` | Privacy policy (template) |
| `404.html` | — | Not-found page |

The bag is a slide-out drawer on every page.

## Files
| File | What it does |
| --- | --- |
| `css/style.css` | All styles. Colors and fonts are CSS variables at the top. |
| `js/config.js` | **Shopify connection settings.** Empty = demo store. |
| `js/shopify.js` | Store layer: products and bag from Shopify's Storefront API, or from the demo catalog. |
| `js/catalog.js` | Demo products and the three ready-made stacks. |
| `js/art.js` | Draws the placeholder jewelry images and the ring-stack preview as SVG. |
| `js/main.js` | Nav, bag drawer, shop filters, product page and stack builder. |

## Brand
- Light blue tone: Sky `#C7DDEE` (announcement bar, badges) · Moonstone `#E2EDF5` (product backgrounds) · Mist `#F0F6FA` (alternate sections) · Line `#D2E0EB`
- Text: Ink `#13263A` (deep navy) · Hematite `#475869` (secondary)
- Accent: Blue `#2C6A98` (focus, hover). Errors use `#A13A3A`.
- Headings: Bodoni Moda at weight 500 with a lower optical size (`"opsz" 28`) so hairlines stay visible at large sizes · Body: Jost (Google Fonts)
- Wordmark is set in type ("Sé Rafi"). Swap in a real logo file when one exists.

## Photography
Lifestyle photos live in `assets/img/` (WebP, max 1200px):
| File | Used on |
| --- | --- |
| `mixed-metal-stacks`, `gold-twist-solitaire-stack`, `gold-marquise-bezel-stacks`, `gemstone-oval-rings`, `gold-diamond-statement-stacks` | Home, "Worn together" |
| `gold-pave-marquise-stack` | Home, craft section |
| `gold-bands-sand` | Shop header |
| `turquoise-gold-pair`, `emerald-sapphire-bezels` | Our story |
| `rose-gold-layered-stacks` | Sizing and care |
| `turquoise-silver-bands` | Contact |
| `silver-geometric-rings` | Not used yet |

## Connect Shopify
1. In Shopify admin, install the **Headless** sales channel and create a storefront.
2. Copy the **public** Storefront API access token. (Public tokens are meant for browsers. Never use an Admin API token here.)
3. Edit `js/config.js`:
   ```js
   domain: 'your-store.myshopify.com',
   storefrontToken: 'your-public-token',
   apiVersion: '2026-07',
   ```
4. Push. Products, prices, stock and the bag now come from Shopify, and **Check out** goes to Shopify's hosted checkout.

### How Shopify products map to the site
| Site needs | Set in Shopify |
| --- | --- |
| Category (Rings, Necklaces, Earrings, Bracelets) | **Product type** = `Rings`, `Necklaces`, `Earrings` or `Bracelets` |
| Metal swatches | A variant option named **Metal** with values containing *Yellow*, *White* or *Rose* (e.g. `14k Yellow Gold`) |
| Ring sizes | A variant option named **Size** (e.g. `4`, `4.5` … `9`) |
| Necklace length | A variant option named **Length** |
| Photo per metal | Assign a variant image to each metal |
| "New" badge / "Most stacked" | Tags `new` and `bestseller` |
| Shows in the stack builder | Product type `Rings`, or tag `stackable` |
| Stack preview drawing | Tags `stack-style:<style>` and `stack-stone:<stone>`. Styles: `thin`, `band`, `dome`, `pave`, `eternity`, `twist`, `solitaire`, `marquise`, `bezel`, `trio`, `signet`. Stones: `diamond`, `spinel`, `sapphire`. |
| Details list on product page | Metafield `custom.details`, type *List of single line text* |

Ready-made stacks in `js/catalog.js` (`SERAFI_STACKS`) refer to products by **handle**. Keep the handles the same in Shopify, or edit that list. Stacks with missing handles skip those rings.

Stack builder lines are added with a `Stack` line-item property (for example `4-ring stack`) so orders show which rings were bought together.

## Placeholders to fill in
Search the project for `[` to find them:
- Free-shipping threshold in the announcement bar
- Brand claims to confirm: size range, metal sourcing, ring sizer offer (home page and `care/`)
- Founder story, name story and workshop details (`about/`)
- Shipping and returns policy (`care/#shipping` and the product page accordion)
- Contact email, phone and hours (`contact/`)
- Privacy policy details and date
- Social links (`href="#"` in the footer)
- Forms: replace `YOUR_FORM_ID` in the newsletter and contact forms with a Formspree form ID, or point them at Klaviyo / Shopify Forms. Until then they show a "not connected" note and send nothing.
- Demo product names, prices and descriptions in `js/catalog.js`

## Images
The demo store draws its own placeholder jewelry illustrations (`js/art.js`), in all three metals. Real product photos come in automatically from Shopify once connected; square images on a light gray background match the layout best. The stack preview on the home page and builder always uses the drawings.

`assets/og-image.png` (1200×630), `assets/logo.png`, `assets/favicon.svg`, `favicon.ico` and the app icons are generated placeholders. Replace them when the final logo is ready.

## SEO
- Every page has its own title, description, canonical URL, Open Graph and Twitter tags.
- JSON-LD: `JewelryStore` + `WebSite` on every page, plus `CollectionPage`, `AboutPage`, `ContactPage` and `BreadcrumbList` where they fit. The product page adds `Product` data once it loads.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`. 404 is `noindex`.
- Canonical URLs currently point at `https://bhaleyart.github.io/serafi/`. When a domain is chosen, find and replace that URL across the project, and change the `/serafi/` links in `404.html` to `/`.
- Product pages are rendered in the browser from `?handle=`. For launch, consider moving the storefront to Shopify's own theme or a server-rendered setup so each product has its own crawlable page.

## Deploy (GitHub Pages)
1. Push to `main`.
2. Repo **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main` / root.
3. Site appears at `https://bhaleyart.github.io/serafi/`.
4. For a custom domain, add a `CNAME` file with the domain and update the URLs noted under SEO.
