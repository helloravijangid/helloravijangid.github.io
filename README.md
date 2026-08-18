# helloravijangid.github.io

Personal site — SEO & AI search consultant. Static, multi-page, no build step,
no framework, no `node_modules`. Deploys automatically from `main` via GitHub Pages.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Home — positioning, stats, services summary |
| `services.html` | `/services.html` | The three services in detail |
| `approach.html` | `/approach.html` | Four-step process and working principles |
| `faq.html` | `/faq.html` | Six FAQs, marked up as `FAQPage` schema |
| `contact.html` | `/contact.html` | Enquiry form |
| `404.html` | — | Custom not-found page |

## Assets

| Path | Purpose |
|---|---|
| `assets/css/site.css` | Entire design system. One file, shared by every page. |
| `assets/js/motion.js` | GSAP motion layer — progressive enhancement only |
| `assets/js/form.js` | Contact form submission |
| `assets/js/vendor/` | GSAP, ScrollTrigger and Lenis, vendored locally (no CDN dependency) |
| `og-image.png` | 1200×630 social share card |

## ⚠️ The contact form needs one setup step

The form posts to [Web3Forms](https://web3forms.com), which relays submissions to
your inbox. **Your email address never appears in the page source** — it lives in
the Web3Forms account, keyed by an access key.

To switch it on:

1. Go to https://web3forms.com and enter the email address where you want enquiries.
2. They email you an **access key** (a UUID).
3. In `contact.html`, replace `WEB3FORMS_ACCESS_KEY` with that key.
4. Commit and push.

Until that is done, the form shows "not connected yet" instead of failing silently.
Free tier covers 250 submissions/month.

## Motion

`motion.js` is layered on top of finished HTML — every element is readable and
visible if the script never loads. It also fully respects
`prefers-reduced-motion: reduce`, in which case it exits before doing anything.

Do not move content into JavaScript. Crawlers and AI answer engines read the HTML.

## Editing

Open the `.html` file and edit. Nothing to compile or install.
The header and footer are duplicated across pages — if you change one, change all five.

## Structured data

`index.html` carries the sitewide `@graph`: `Person`, `WebSite`, `ProfessionalService`.
Every page adds `WebPage` + `BreadcrumbList`. `faq.html` adds `FAQPage`.
**If you edit the FAQ copy, update the schema in the same commit** or the two drift apart.
