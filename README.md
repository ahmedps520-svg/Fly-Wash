# Fly Wash — فلاي واش لخدمات الغسيل و التلميع المتنقل

Spec build: a website made for a real Jeddah business that has no site of its own, on Mamar's initiative. **Not commissioned.** Built to show the owner, not published as theirs.

**Live:** https://ahmedps520-svg.github.io/Fly-Wash/

| | |
|---|---|
| Business | Mobile car wash |
| District | الشاطئ، جدة |
| Google | 4.9★ · 1,232 reviews (checked 7 Oct 2026) |
| Phone | 056 039 0116 |
| Web presence before this | linktr.ee only |
| Hours | Sat–Thu 3pm–12am · Fri closed |
| Maps | https://www.google.com/maps/place/?q=place_id:ChIJPRtNbm3bwxUR3IRirI3yzUQ |

## The idea

A route that draws itself across a city map as you scroll, with the van driving it to a pin marked “you”. Their own line on Google is “نجيك مكان ماتكون” — the whole site is that sentence.

**Palette:** Warm paper, tangerine, plum · **Type:** Rubik · Bricolage Grotesque

## Where the content came from

Everything on the page comes from the business's own Google Maps listing — the owner's description, the hours, the listed attributes, and the reviews. Nothing is invented: no prices, no staff names, no history, no claims they haven't made.

**Reviews:** 5 quoted. 3 others were 5-star but thank workers by name, so they are left out. Reviews are 5-star only, verbatim, and never ones that praise an individual employee — staff move on.

## Before it goes live for them

- **Photos.** The page is deliberately image-free — no stock, and no AI pictures pretending to be their shop. Five real photos from the owner and it's done.
- **Owner check.** Confirm hours, services and the WhatsApp number.
- **Remove** `<meta name="robots" content="noindex, nofollow">` once they adopt it. Until then it stays, so this page never competes with their own listing in search.

## Tech

Plain HTML, CSS and JavaScript — no framework, no build step. Arabic is the default and ships in the markup; English is a toggle remembered in `localStorage`. Opening hours and "open now" are computed in Jeddah time (UTC+3), wherever the visitor is.

---
Developed by [Mamar](https://mamar.site)
