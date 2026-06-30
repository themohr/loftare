# Loftare Studio — Site Documentation

**Why:** Marketing/sales instrument for Loftare Studio (Dennis Mohr). Converts ultra-luxury vacation estate owners into discovery call bookings. No framework, no npm, no build step. Deployed on Hostinger shared hosting. Git: https://github.com/themohr/loftare (main branch).

**How to apply:** Read this before any maintenance work. Every file write must go through Python (not PowerShell) to avoid UTF-8 corruption.

---

## File Structure

```
loftare/
├── index.html          # Homepage — nav INLINED (not fetched), LCP-optimized hero
├── about.html
├── contact.html
├── services.html
├── work.html
├── journal.html
├── aspen.html          # Location landing pages
├── vail.html
├── jackson-hole.html
├── park-city.html
├── form-handler.php    # PHP contact form (Hostinger mail())
├── robots.txt
├── sitemap.xml
├── vercel.json
├── .htaccess
├── css/
│   ├── styles.css      # SOURCE — edit this
│   └── styles.min.css  # Minified — regenerate after every styles.css edit
├── js/
│   └── main.js
├── components/
│   ├── nav.html        # Fetched on all pages EXCEPT index.html
│   └── footer.html
├── images/
│   ├── hero-bg2.webp   # 396KB, quality 68 — hero background
│   └── solaire-preview.webp  # 62KB, quality 72
├── journal/
│   ├── airbnb-fee-increase-2025.html
│   ├── why-we-built-solaire.html
│   ├── building-a-booking-engine.html
│   ├── the-stack-behind-solaire.html
│   └── lodgify-vs-hostaway-vs-studio.html  # Newest (Jun 2026)
└── work/
    └── solaire.html
```

---

## Design Tokens (css/styles.css)

```css
:root {
  --pitch: #111210;        /* near-black, primary background */
  --linen: #F2EFE9;        /* warm off-white, section backgrounds */
  --graphite: #3D3D3B;     /* body text on light backgrounds */
  --chalk: #E8E4DC;        /* borders on light backgrounds */
  --ember: #B5541E;        /* brand accent, CTAs, eyebrows */
  --snow: #FFFFFF;
  --muted: #9A9790;        /* secondary/caption text — solid (not alpha, contrast fix) */
  --font-display: 'Cormorant', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'DM Mono', 'Courier New', monospace;
  --max-width: 1200px;
}
```

**Key CSS classes:**
- `.reveal` / `.reveal.visible` — scroll animation via IntersectionObserver
- `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost` — button variants
- `.eyebrow` — small uppercase label, ember color
- `.mono` — DM Mono font
- `.display`, `.display-xl/lg/md/sm` — heading scale (clamp-based)
- `.hero` — position:relative, min-height:100vh, flex center; NO background-image
- `.hero-overlay` — absolute inset gradient
- `.calculator` — glass effect, rgba + backdrop-filter blur
- `.section-inner` — max-width container with horizontal padding
- `.content-narrow` — narrower column for post bodies
- `.contact-form-wrap` — max-width:640px, centered
- `.nav-active` — ember color + bottom border for active mobile nav link
- `.footer-bottom` — color: #9A9790 (solid, not alpha — contrast fix applied)
- `.feature-list li::before` — content: '·' (U+00B7 middle dot — was corrupted as Â·, fixed)
- `.post-read-time` — NO padding-top (36px was incorrectly set, removed)

---

## CSS Minification (run after every styles.css edit)

```python
import re
with open(r'C:/Users/dmohr/Documents/GitHub/loftare/css/styles.css', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'/\*[\s\S]*?\*/', '', c)
c = re.sub(r'\s+', ' ', c)
c = re.sub(r'\s*([{};:,>~+])\s*', r'\1', c)
c = c.replace(';}', '}').strip()
with open(r'C:/Users/dmohr/Documents/GitHub/loftare/css/styles.min.css', 'w', encoding='utf-8') as f:
    f.write(c)
```

---

## JavaScript (js/main.js)

**CONFIG block:**
```javascript
const CONFIG = {
  formspreeId:  'YOUR_FORMSPREE_ID',  // unused — form posts to /form-handler.php
  calendlyUrl:  'https://calendly.com/dennis-loftare/discovery',
  contactEmail: 'dennis@loftare.studio',
  siteUrl:      'https://loftare.studio',
};
```

**Functions:**
- `loadComponent(id, file)` — fetches /components/{file} into element #{id}
- `initNavScroll()` — adds `.scrolled` to #site-nav after 60px scroll
- `initActiveNav()` — adds `.active` to matching desktop nav/footer links
- `initMobileMenu()` — hamburger toggle, `.nav-active` on active links, close on link click
- `initCalculator()` — FEE_RATE=0.155; static label "Airbnb's cut at 15.5%."
- `initReveal()` — IntersectionObserver threshold 0.15, adds `.visible` to `.reveal`
- `initFAQ()` — accordion toggle on `.faq-item`, single-open
- `initContactForm()` — POSTs FormData to `/form-handler.php`, checks `json.success`

**Boot sequence:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('nav-placeholder', 'nav.html').then(() => {
    initNavScroll();
    initActiveNav();
    initMobileMenu();
  });
  loadComponent('footer-placeholder', 'footer.html');
  initCalculator();
  initReveal();
  initFAQ();
  initContactForm();
  initCalendly();
});
```

---

## Page `<head>` Template (canonical pattern for all pages)

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page title]</title>
  <meta name="description" content="[Description]">
  <link rel="canonical" href="https://loftare.studio/[path]">

  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:url" content="https://loftare.studio/[path]">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://loftare.studio/images/hero-bg2.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="...">
  <meta name="twitter:description" content="...">
  <meta name="twitter:image" content="https://loftare.studio/images/hero-bg2.webp">

  <script type="application/ld+json">{ ... }</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="[same fonts URL]"></noscript>
  <link rel="stylesheet" href="/css/styles.min.css">
</head>
```

**index.html only — additional head items (LCP optimization):**
```html
<link rel="preload" as="image" href="/images/hero-bg2.webp">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pitch:#111210;--linen:#F2EFE9;--ember:#B5541E;--snow:#FFFFFF}
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--pitch);color:var(--snow)}
.hero{min-height:100vh;position:relative;display:flex;align-items:center;justify-content:center;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.60) 50%,rgba(0,0,0,0.82) 100%)}
.hero-inner{position:relative;z-index:2;text-align:center;padding:0 24px}
</style>
```

---

## index.html — Hero & Nav

**Hero (LCP-optimized — img tag, NOT CSS background-image):**
```html
<section class="hero">
  <img src="/images/hero-bg2.webp" alt="Luxury vacation estate — Loftare Studio direct booking platform"
       fetchpriority="high" decoding="async"
       style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;">
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="hero-inner">
    <!-- eyebrow, h1, subhead, calculator -->
  </div>
</section>
```

**Nav is INLINED on index.html** (avoids JS fetch delay for LCP). All other pages use `<div id="nav-placeholder"></div>`.

```html
<nav id="site-nav">
  <a href="/" class="nav-wordmark">Loftare Studio</a>
  <ul class="nav-links">
    <li><a href="/work.html">Work</a></li>
    <li><a href="/services.html">Services</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/journal.html">Journal</a></li>
    <li><a href="/contact.html" class="nav-cta">Book a call</a></li>
  </ul>
  <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
  <button class="mobile-close" id="mobile-close" aria-label="Close menu">&times;</button>
  <a href="/work.html">Work</a>
  <a href="/services.html">Services</a>
  <a href="/about.html">About</a>
  <a href="/journal.html">Journal</a>
  <a href="/contact.html" style="color: var(--ember);">Book a call</a>
</div>
```

---

## Journal Post Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- [standard head template] -->
  <!-- JSON-LD: Article or TechArticle -->
</head>
<body>
<div id="nav-placeholder"></div>
<div class="post-hero">
  <div class="content-narrow">
    <div class="post-hero-meta reveal">
      <span class="post-tag">Industry</span>
      <span class="post-date mono">Month DD, YYYY</span>
      <span class="post-read-time mono">N min read</span>
    </div>
    <h1 class="display display-md reveal" style="transition-delay:100ms">Title</h1>
    <p class="reveal" style="transition-delay:200ms;font-size:18px;color:var(--muted);margin-top:20px;line-height:1.65">Deck</p>
  </div>
</div>
<section class="section-post-body">
  <div class="section-inner">
    <div class="post-body reveal">
      <!-- paragraphs, h2 headings -->
      <div class="post-cta">
        <p>CTA text</p>
        <a href="/contact.html" class="btn btn-primary">Book a discovery call &rarr;</a>
      </div>
      <div class="related-posts">
        <p class="eyebrow">Related</p>
        <ul class="related-list">
          <li><a href="/journal/[slug].html">Title &rarr;</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>
<div id="footer-placeholder"></div>
<script src="/js/main.js" defer></script>
</body>
</html>
```

**Publishing a new post:** (1) create HTML in /journal/ using template, (2) add card to journal.html list in first position.

---

## JSON-LD Schemas by Page

- `index.html`: ProfessionalService (Dennis Mohr / Loftare Studio)
- `services.html`: Service + hasOfferCatalog (3 Offers) + FAQPage (4 questions)
- `about.html`: Person (Dennis Mohr, Founder)
- `work.html`: CreativeWork (Solaire demonstration platform)
- `journal/[post].html`: Article or TechArticle per post

---

## contact.html

Single centered form, max-width 640px, no Calendly embed.
```html
<form class="contact-form" id="contact-form" novalidate>
  <!-- Name (required), Email (required), Property/location (optional), Message (required, rows=5) -->
  <button type="submit" class="btn btn-primary form-submit">Send message &rarr;</button>
</form>
<p class="demo-note" style="text-align:center;margin-top:20px">We respond to every inquiry within 24 hours.</p>
```

---

## form-handler.php

- Validates required fields (name, email, message); `filter_var` for email
- `mail()` to dennis@loftare.studio, From: dennis@loftare.studio, Reply-To: submitter
- Returns `{"success": true}` or `{"success": false, "error": "..."}`
- CORS: `Access-Control-Allow-Origin: https://loftare.studio`

---

## .htaccess

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
AddType text/xml .xml
```

`AddType text/xml .xml` — required for Google Search Console (Hostinger defaults to `application/xml`).

---

## Critical Rules for File Manipulation

**ALWAYS use Python for file writes. NEVER PowerShell Set-Content.** PowerShell writes UTF-16 LE and corrupts:
- Em dashes → `â€"` (bytes: `\xc3\xa2\xe2\x82\xac\xe2\x80\x9d`)
- Middle dot → `Â·`

**Standard Python write pattern:**
```python
with open(path, encoding='utf-8') as f:
    c = f.read()
# ... modify c ...
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
```

**Other gotchas:**
- Strip BOM if present: `if raw.startswith(b'\xef\xbb\xbf'): raw = raw[3:]`
- CRLF normalization: `raw.replace(b'\r\n', b'\n')`
- Node.js inline scripts with backticks fail in shell — write to a temp .js file instead
- The Edit/Write tools require a prior Read in the same session

---

## Fonts

Cormorant (display), DM Sans (body), DM Mono (mono/calculator). Always loaded async:
```html
<link rel="stylesheet" href="[fonts URL]" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="[same URL]"></noscript>
```
Do NOT add preload hints for specific woff2 URLs — causes console errors (stale/wrong URLs).
