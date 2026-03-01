# URL Trimmer — Project Guide for Claude Code

## Project Purpose

A TamperMonkey userscript that cleans tracking and useless URL parameters **from the browser address bar only**. It does NOT intercept network requests or block them from reaching the server (unlike ClearURLs). The sole goal is producing clean, shareable URLs.

## Core Design Decisions

### Blacklist Mode Only
- Remove known-bad params; leave everything else untouched.
- No allowlist, no hash cleaning, no redirect unwrapping (unless explicitly requested).
- Two levels of rules:
  1. **Global rules** — applied to every URL (e.g., `utm_*`, `fbclid`, `gclid`)
  2. **Provider rules** — applied only when the URL hostname matches a provider's `urlPattern`

### Matching Strategy
- **Hostname matching**: Use a `Map<domain, provider>` built at init time. At runtime, walk up the hostname hierarchy (`m.youtube.com` → `youtube.com`) doing `Map.get()` at each level — **O(hostname depth)**, independent of provider count.
- **Param matching**: Each param rule is a pre-compiled `RegExp` anchored with `^` and `$` (full-key match). Pre-compile at script init, not on each URL change.
- Do NOT use RegExp for hostname/URL matching — simple domain string lookup is faster and more readable.
- Do NOT use `new RegExp(str)` inside hot paths (URL change hooks).

### Address Bar Only
- Hook `history.pushState` and `history.replaceState` on `window` (not `unsafeWindow`, unless cross-origin page code bypasses the sandbox).
- Also clean the initial URL on `@run-at document-start` via a single `history.replaceState`.
- Never call `location.href =` or `location.replace()` — this causes a full page navigation.

## TamperMonkey API Standards

### Metadata
```javascript
// @run-at       document-start   ← earliest possible, before any page scripts set history
// @match        *://*/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
```
- Use `@run-at document-start` to clean the initial URL before the page renders.
- Prefer modern `GM.*` (Promise-based) over legacy `GM_*` (callback-based), except `GM_registerMenuCommand` which has no `GM.` equivalent yet.
- Grant only what is actually used. Don't grant `unsafeWindow` unless necessary.

### History Patching Pattern (from mbga.js)
```javascript
const _pushState = history.pushState.bind(history);
history.pushState = function (state, unused, url) {
  return _pushState(state, unused, cleanUrl(url));
};
const _replaceState = history.replaceState.bind(history);
history.replaceState = function (state, unused, url) {
  return _replaceState(state, unused, cleanUrl(url));
};
// Clean initial URL
history.replaceState(history.state, '', cleanUrl(location.href));
```

## Rules Structure

### Format
```javascript
const RULES = {
  // Pre-compiled global param patterns (applied to ALL URLs)
  globalParams: [
    /^utm_[a-z_]+$/i,
    /^fbclid$/i,
    // ...
  ],

  // Provider-specific rules
  providers: [
    {
      name: 'YouTube',
      domains: ['youtube.com', 'youtu.be'],  // auto-matches subdomains
      params: [/^si$/i, /^feature$/i, /^pp$/i],
    },
    {
      name: 'Google',
      domains: ['google.com', 'google.com.hk'],  // list only TLDs you use
      params: [/^ved$/i, /^ei$/i, /^gs_[a-z]*$/i],
    },
    // ...
  ],
};
```

### Init-Time Domain Map
```javascript
// Build once at script start:
const domainMap = new Map();
for (const p of RULES.providers)
  for (const d of p.domains) domainMap.set(d, p);

// Runtime lookup — walk up hostname hierarchy:
function findProvider(hostname) {
  let h = hostname;
  while (h) {
    if (domainMap.has(h)) return domainMap.get(h);
    const dot = h.indexOf('.');
    if (dot === -1) break;
    h = h.substring(dot + 1);
  }
  return null;
}
```

### Rule Authoring Guidelines
- **Provider matching**: Use `domains` array with bare domain names (e.g., `'youtube.com'`). Subdomains are matched automatically by the hostname walk-up. For multi-TLD sites (Google, Amazon), list only the TLDs you personally use.
- **Param patterns**: One `RegExp` per parameter name; anchor with `^` and `$`; flag `i` by default.
- Keep global rules minimal — only universally useless params (UTM, click IDs, etc.).
- Site-specific rules live in `providers[]` sorted by descending traffic/importance.

## Reference Sources

| Source | Purpose |
|--------|---------|
| `mbga.js` (local) | Reference for history patching, uselessUrlParams pattern, TamperMonkey idioms |
| [ClearURLs rules](https://gitlab.com/ClearURLs/rules/-/blob/master/data.min.json) | Authoritative param blacklists per provider — cherry-pick, don't copy wholesale |
| [Tampermonkey docs](https://www.tampermonkey.net/documentation.php) | GM API reference, metadata directives |

## Covered Websites (Initial Scope)

Priority sites for provider rules (in order):
1. Google Search / Google services
2. YouTube
3. Twitter / X
4. GitHub
5. Amazon (amazon.com, amazon.co.jp, etc.)
6. Bilibili
7. Taobao / Tmall
8. Reddit
9. LinkedIn
10. Zhihu
11. JD.com (京东)
12. Baidu
13. Weibo
14. TikTok / Douyin

## What NOT To Do

- Do NOT intercept `fetch()` or `XMLHttpRequest` — this is address-bar-only.
- Do NOT add allowlist logic, redirect following, or hash stripping unless the user asks.
- Do NOT use `location.href =` or `location.replace()` (causes navigation).
- Do NOT create per-site content scripts or inject DOM elements (no UI unless requested).
- Do NOT use deprecated `GM_xmlhttpRequest` or other legacy GM APIs unnecessarily.
- Do NOT over-engineer: no external rule fetching, no remote updates, no complex config UI.

## File Layout

```
url-trimmer/
  trimmer.user.js   ← single-file userscript (keep it self-contained)
  mbga.js           ← reference only, do not modify
  CLAUDE.md         ← this file
```

## Code Style

- Modern ES2020+ (TamperMonkey supports V8).
- No TypeScript, no build step — plain `.user.js`.
- Prefer `const` / `let`; no `var`.
- Short, self-documenting variable names; inline comments only where non-obvious.
- Group sections with `// --- Section Name ---` comments.
