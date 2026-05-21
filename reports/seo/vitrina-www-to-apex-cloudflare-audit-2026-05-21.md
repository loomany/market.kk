# Cloudflare www → apex audit — vitrina.help

**Date:** 2026-05-21  
**Scope:** DNS, SSL 525 on `www`, redirect to apex. **No app/sitemap code changes.**

---

## Live probe summary

| URL | Status | Content-Type | Notes |
|-----|--------|--------------|-------|
| `https://vitrina.help/sitemap.xml` | **200** | `application/xml` | Valid sitemap, 253 `<loc>`, `x-railway-edge` present |
| `https://www.vitrina.help/sitemap.xml` | **525** | `text/plain` | Body: `error code: 525` (15 B) |
| `https://vitrina.help/` | **308** → `/ru` | `text/html` | Next.js prerender, Railway origin OK |
| `https://www.vitrina.help/` | **525** | `text/plain` | Same SSL failure |

**Conclusion:** Apex is healthy end-to-end. `www` fails at **Cloudflare → origin TLS** before the request reaches Next.js/Railway. **Redirects in `next.config` cannot fix 525** until edge redirect or origin cert for `www` exists.

---

## 1. DNS (public resolvers / DNS-over-HTTPS)

| Host | Public records | Cloudflare proxy |
|------|----------------|------------------|
| `vitrina.help` | A → `104.21.65.18`, `172.67.139.94`; AAAA → `2606:4700:3036::6815:4112`, `2606:4700:3037::ac43:8b5e` | Yes (CF anycast) |
| `www.vitrina.help` | A → same IPv4; AAAA → same IPv6 pattern | Yes (CF anycast) |

- **No conflicting public CNAME** for `www` in DoH (typical when dashboard uses **proxied CNAME** flattened to A/AAAA).
- **NS:** `dayana.ns.cloudflare.com`, `dns.cloudflare.com` — zone on Cloudflare.

### Checklist in Cloudflare Dashboard → DNS

- [ ] Record **`www`** exists (usually **CNAME** → `vitrina.help` or Railway target).
- [ ] **Proxy status: Proxied** (orange cloud) — matches live CF IPs.
- [ ] No duplicate `www` (A + CNAME conflict).
- [ ] Apex `@` points to same origin target as production (Railway custom domain).

---

## 2. Railway (inferred — verify in dashboard)

Live apex responses include:

- `x-railway-edge: railway/europe-west4-drams3a`
- `x-railway-request-id: …`

**Inferred:** Custom domain **`vitrina.help`** is attached and serving TLS.

### Checklist Railway → Project → Settings → Domains

- [ ] **`vitrina.help`** — Active, certificate **Valid**.
- [ ] **`www.vitrina.help`** — likely **missing** or **not validated** → explains **525** (CF connects with SNI `www.vitrina.help`, origin has no matching cert).

**Two valid strategies:**

| Strategy | Railway `www` | Cloudflare |
|----------|---------------|------------|
| **A (recommended)** | Not required | **301 redirect** `www` → apex at edge (before origin) |
| **B** | Add `www.vitrina.help`, wait for Valid cert | Then optional redirect for canonical URL |

Use **A** for SEO canonical host and minimal moving parts.

---

## 3. Cloudflare SSL/TLS

**Error 525** = *SSL handshake failed* between Cloudflare and origin for the hostname on the request (`www.vitrina.help`).

Typical when:

- SSL mode is **Full** / **Full (strict)** (correct for Railway), but
- Origin only presents cert for `vitrina.help`, not `www.vitrina.help`.

### Checklist SSL/TLS

- [ ] Mode: **Full** or **Full (strict)** (not Flexible-only for this setup).
- [ ] **Edge Certificates** — Universal SSL covers `vitrina.help` and `www.vitrina.help` (client ↔ CF OK; 525 is origin-side).
- [ ] No broken **Origin Certificate** requirement for `www` if using strategy **A** (redirect never hits origin on `www`).

---

## 4. Recommended fix — Redirect Rule (edge)

**Goal:**

```txt
https://www.vitrina.help/* → https://vitrina.help/$1
```

### Cloudflare Dashboard (2024+ UI)

**Rules → Redirect Rules → Create rule**

| Field | Value |
|-------|--------|
| **Name** | `www to apex 301` |
| **When** | Custom filter expression: `(http.host eq "www.vitrina.help")` |
| **Then** | Dynamic redirect |
| **Expression** | `concat("https://vitrina.help", http.request.uri.path)` |
| **Query string** | Preserve query string: **Yes** |
| **Status code** | **301** |

Alternative (wildcard-style):

- **Static redirect** to `https://vitrina.help/${1}` with path capture if your plan UI offers “Wildcard replace”.

**Legacy:** Page Rule — `www.vitrina.help/*` → Forwarding URL `https://vitrina.help/$1` (301). One Page Rule slot.

### After apply — verify

```bash
curl -I https://www.vitrina.help/sitemap.xml
# Expect: HTTP/2 301
# location: https://vitrina.help/sitemap.xml

curl -sL -o NUL -w "%{url_effective} %{http_code}\n" https://www.vitrina.help/sitemap.xml
# Expect: https://vitrina.help/sitemap.xml 200
```

---

## 5. SEO / Webmaster

- GSC / Yandex property: use **`https://vitrina.help`** (apex), not `www`.
- Submit sitemap: `https://vitrina.help/sitemap.xml` only.
- After redirect: optional **Change of address** not needed if `www` never indexed (525).

---

## 6. What NOT to change in repo

- `app/sitemap.ts` — OK as-is (URLs already apex).
- `next.config.ts` redirects — useless for 525 until edge/Railway `www` TLS fixed.
- `NEXT_PUBLIC_SITE_URL` — keep `https://vitrina.help`.

---

## 7. Owner action summary

| Step | Where | Action |
|------|--------|--------|
| 1 | Cloudflare DNS | Confirm `www` proxied, no duplicate records |
| 2 | Cloudflare Rules | Add **301** redirect `www` → `vitrina.help` (preserve path + query) |
| 3 | Railway | Confirm apex domain Valid; **skip** adding `www` if using edge redirect only |
| 4 | Terminal | Run curl checks above |
| 5 | Yandex/GSC | Use apex URLs only |

**Blocked without dashboard access:** This repo has no Cloudflare API token / IaC; agent cannot apply rules automatically.
