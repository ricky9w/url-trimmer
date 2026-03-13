// ==UserScript==
// @name         URL Trimmer (Dev)
// @namespace    https://github.com/ricky9w/url-trimmer
// @version      0.2.2-dev
// @description  Clean tracking parameters from the browser address bar (dev build with logging)
// @author       ricky9w
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ricky9w/url-trimmer/main/trimmer.dev.user.js
// @downloadURL  https://raw.githubusercontent.com/ricky9w/url-trimmer/main/trimmer.dev.user.js
// ==/UserScript==

'use strict';

(function () {
  const TAG = '[URL Trimmer]';

  // --- Inline Rules ---

  const RULES = {
    globalParams: [
      /^utm_[a-z_]+$/i,
      /^mtm_[a-z_]*$/i,
      /^gclid$/i,
      /^fbclid$/i,
      /^msclkid$/i,
    ],
    providers: [
      {
        name: 'YouTube',
        domains: ['youtube.com', 'youtu.be'],
        params: [/^feature$/i, /^kw$/i, /^si$/i, /^pp$/i],
      },
      {
        name: 'Twitter',
        domains: ['twitter.com', 'x.com'],
        params: [/^s$/i, /^t$/i, /^ref_src$/i, /^ref_url$/i],
      },
      {
        name: 'GitHub',
        domains: ['github.com'],
        params: [/^email_source$/i, /^email_token$/i],
      },
      {
        name: 'Bilibili',
        domains: ['bilibili.com'],
        params: [
          /^buvid$/i, /^is_story_h5$/i, /^launch_id$/i, /^live_from$/i,
          /^mid$/i, /^session_id$/i, /^timestamp$/i, /^up_id$/i,
          /^vd_source$/i, /^share/i, /^spm/i,
          /^callback$/i, /^from_source$/i, /^from$/i, /^seid$/i,
          /^from_spmid$/i, /^referfrom$/i, /^bilifeed_channel$/i,
          /^unique_k$/i,
          /^msource$/i, /^refer_from$/i, /^plat_id$/i, /^bbid$/i,
          /^ts$/i, /^visit_id$/i, /^broadcast_type$/i, /^is_room_feed$/i,
        ],
      },
      {
        name: 'Xiaohongshu',
        domains: ['xiaohongshu.com', 'xhslink.com'],
        params: [
          /^xhsshare$/i, /^appuid$/i, /^apptime$/i,
          /^share_id$/i, /^xsec_source$/i, /^xsec_token$/i,
        ],
      },
      {
        name: 'Taobao / Tmall',
        domains: ['taobao.com', 'tmall.com'],
        params: [
          /^spm$/i, /^pvid$/i, /^scm$/i, /^ali_refid$/i, /^ali_trackid$/i,
          /^utparam$/i, /^ns$/i, /^abbucket$/i, /^acm$/i,
          /^user_number_id$/i, /^activity_id$/i,
          /^mi_id$/i, /^xxc$/i, /^priceTId$/i, /^mm_sceneid$/i,
          /^from$/i, /^item_type$/i,
        ],
      },
      {
        name: '1688',
        domains: ['1688.com'],
        params: [
          /^pvid$/i, /^scm$/i, /^ali_refid$/i, /^ali_trackid$/i,
          /^utparam$/i, /^ns$/i, /^abbucket$/i, /^acm$/i,
          /^offerId$/i, /^skuId$/i, /^hotSaleSkuId$/i, /^scene$/i,
          /^from$/i, /^trace_log$/i, /^tracelog$/i, /^uuid$/i,
          /^sessionid$/i, /^pageId$/i, /^abBizDataType$/i,
          /^pcLoginAbJumpBeforeTimeStr$/i, /^cosite$/i,
          /^_p_isad$/i, /^clickid$/i,
          /^sortType$/i, /^forcePC$/i,
        ],
      },
      {
        name: 'TikTok',
        domains: ['tiktok.com'],
        params: [
          /^_d$/i, /^_r$/i, /^_t$/i, /^checksum$/i, /^is_copy_url$/i,
          /^is_from_webapp$/i, /^sec_uid$/i, /^sec_user_id$/i,
          /^share_app_id$/i, /^share_link_id$/i,
        ],
      },
      {
        name: 'Reddit',
        domains: ['reddit.com'],
        params: [
          /^\$deep_link$/i, /^\$android_deeplink$/i, /^\$ios_deeplink$/i,
          /^utm_name$/i, /^share_id$/i, /^ref$/i, /^ref_source$/i,
          /^correlation_id$/i, /^rdt$/i,
        ],
      },
      {
        name: 'Instagram',
        domains: ['instagram.com'],
        params: [/^igshid$/i, /^igsh$/i],
      },
      {
        name: 'LinkedIn',
        domains: ['linkedin.com'],
        params: [/^trackingId$/i, /^refId$/i, /^trk$/i, /^midToken$/i],
      },
      {
        name: 'Weibo',
        domains: ['weibo.com', 'weibo.cn'],
        params: [/^sudaref$/i, /^display$/i],
      },
      {
        name: 'Sohu',
        domains: ['sohu.com'],
        params: [/^spm$/i, /^pvid$/i],
      },
      {
        name: 'WeChat MP',
        domains: ['mp.weixin.qq.com'],
        params: [
          /^scene$/i, /^from_masonry$/i,
          /^sharer_shareinfo$/i, /^sharer_shareinfo_first$/i,
          /^poc_token$/i, /^chksm$/i, /^version$/i, /^ascene$/i,
          /^mpshare$/i, /^srcid$/i,
        ],
      },
    ],
  };

  // --- Domain Map ---

  const domainMap = new Map();
  for (const p of RULES.providers)
    for (const d of p.domains) domainMap.set(d, p);

  console.log(`${TAG} loaded ${RULES.providers.length} providers, ${RULES.globalParams.length} global rules`);

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

      if (provider) {
        console.log(`${TAG} matched provider: ${provider.name} (${urlObj.hostname})`);
      }

      let changed = false;
      const removed = [];
      for (const key of [...urlObj.searchParams.keys()]) {
        if (patterns.some((re) => re.test(key))) {
          removed.push(key);
          urlObj.searchParams.delete(key);
          changed = true;
        }
      }

      if (!changed) return url;

      console.log(`${TAG} removed params: [${removed.join(', ')}]`);
      console.log(`${TAG} cleaned: ${urlObj.pathname}${urlObj.search}`);

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
