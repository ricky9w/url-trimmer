// ==UserScript==
// @name         URL Trimmer
// @namespace    https://github.com/ricky9w/url-trimmer
// @version      0.2.0
// @description  Clean tracking parameters from the browser address bar
// @author       ricky9w
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/ricky9w/url-trimmer@main/rules.js
// ==/UserScript==

'use strict';

(function () {
  // --- Compile Rules ---

  /* global URL_TRIMMER_RULES */
  const raw = URL_TRIMMER_RULES;
  const compile = (s) => new RegExp(s, 'i');

  const RULES = {
    globalParams: raw.globalParams.map(compile),
    providers: raw.providers.map((p) => ({
      name: p.name,
      domains: p.domains,
      params: p.params.map(compile),
    })),
  };

  // --- Domain Map ---

  const domainMap = new Map();
  for (const p of RULES.providers)
    for (const d of p.domains) domainMap.set(d, p);

  // --- Provider Lookup ---

  function findProvider(hostname) {
    let h = hostname;
    while (h) {
      const p = domainMap.get(h);
      if (p) return p;
      const dot = h.indexOf('.');
      if (dot === -1) break;
      h = h.substring(dot + 1);
    }
    return null;
  }

  // --- URL Cleaning ---

  function cleanUrl(url) {
    if (!url) return url;
    try {
      const urlObj = new URL(url, location.href);
      if (!urlObj.search) return url;

      const provider = findProvider(urlObj.hostname);
      const patterns = provider
        ? RULES.globalParams.concat(provider.params)
        : RULES.globalParams;

      let changed = false;
      for (const key of [...urlObj.searchParams.keys()]) {
        if (patterns.some((re) => re.test(key))) {
          urlObj.searchParams.delete(key);
          changed = true;
        }
      }

      if (!changed) return url;

      const isRelative = url.startsWith('/') && !url.startsWith('//');
      if (isRelative) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
      }
      return urlObj.href;
    } catch {
      return url;
    }
  }

  // --- History Patching ---

  const _pushState = history.pushState.bind(history);
  history.pushState = function (state, unused, url) {
    return _pushState(state, unused, cleanUrl(url));
  };

  const _replaceState = history.replaceState.bind(history);
  history.replaceState = function (state, unused, url) {
    return _replaceState(state, unused, cleanUrl(url));
  };

  _replaceState(history.state, '', cleanUrl(location.href));
})();
