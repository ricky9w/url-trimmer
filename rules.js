/* URL Trimmer — Rule Definitions
 * Loaded via @require by the main userscript.
 *
 * Format:
 *   globalParams — regex source strings, matched against param keys (full match, case-insensitive)
 *   providers[]  — per-domain rules; each param is a regex source string
 *
 * Regex conventions:
 *   - Anchored: "^utm_[a-z_]+$"  matches the full param key
 *   - Prefix:   "^spm"           matches any key starting with "spm" (no $ anchor)
 */

/* eslint-disable no-unused-vars */
const URL_TRIMMER_RULES = {
  globalParams: [
    '^utm_[a-z_]+$',
    '^mtm_[a-z_]*$',
    '^gclid$',
    '^fbclid$',
    '^msclkid$',
  ],
  providers: [
    {
      name: 'YouTube',
      domains: ['youtube.com', 'youtu.be'],
      params: ['^feature$', '^kw$', '^si$', '^pp$'],
    },
    {
      name: 'Bilibili',
      domains: ['bilibili.com'],
      params: [
        '^buvid$', '^is_story_h5$', '^launch_id$', '^live_from$',
        '^mid$', '^session_id$', '^timestamp$', '^up_id$',
        '^vd_source$', '^share', '^spm',
        '^callback$', '^from_source$', '^from$', '^seid$',
        '^from_spmid$', '^referfrom$', '^bilifeed_channel$',
        '^unique_k$',
      ],
    },
  ],
};
