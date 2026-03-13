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
      name: 'Twitter',
      domains: ['twitter.com', 'x.com'],
      params: ['^s$', '^t$', '^ref_src$', '^ref_url$'],
    },
    {
      name: 'GitHub',
      domains: ['github.com'],
      params: ['^email_source$', '^email_token$'],
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
        '^msource$', '^refer_from$', '^plat_id$', '^bbid$',
        '^ts$', '^visit_id$', '^broadcast_type$', '^is_room_feed$',
      ],
    },
    {
      name: 'Xiaohongshu',
      domains: ['xiaohongshu.com', 'xhslink.com'],
      params: [
        '^xhsshare$', '^appuid$', '^apptime$',
        '^share_id$', '^xsec_source$', '^xsec_token$',
      ],
    },
    {
      name: 'Taobao / Tmall',
      domains: ['taobao.com', 'tmall.com'],
      params: [
        '^spm$', '^pvid$', '^scm$', '^ali_refid$', '^ali_trackid$',
        '^utparam$', '^ns$', '^abbucket$', '^acm$',
        '^user_number_id$', '^activity_id$',
        '^mi_id$', '^xxc$', '^priceTId$', '^mm_sceneid$',
        '^from$', '^item_type$',
      ],
    },
    {
      name: '1688',
      domains: ['1688.com'],
      params: [
        '^pvid$', '^scm$', '^ali_refid$', '^ali_trackid$',
        '^utparam$', '^ns$', '^abbucket$', '^acm$',
        '^offerId$', '^skuId$', '^hotSaleSkuId$', '^scene$',
        '^from$', '^trace_log$', '^tracelog$', '^uuid$',
        '^sessionid$', '^pageId$', '^abBizDataType$',
        '^pcLoginAbJumpBeforeTimeStr$', '^cosite$',
        '^_p_isad$', '^clickid$',
        '^sortType$', '^forcePC$',
      ],
    },
    {
      name: 'TikTok',
      domains: ['tiktok.com'],
      params: [
        '^_d$', '^_r$', '^_t$', '^checksum$', '^is_copy_url$',
        '^is_from_webapp$', '^sec_uid$', '^sec_user_id$',
        '^share_app_id$', '^share_link_id$',
      ],
    },
    {
      name: 'Reddit',
      domains: ['reddit.com'],
      params: [
        '^\\$deep_link$', '^\\$android_deeplink$', '^\\$ios_deeplink$',
        '^utm_name$', '^share_id$', '^ref$', '^ref_source$',
        '^correlation_id$', '^rdt$',
      ],
    },
    {
      name: 'Instagram',
      domains: ['instagram.com'],
      params: ['^igshid$', '^igsh$'],
    },
    {
      name: 'LinkedIn',
      domains: ['linkedin.com'],
      params: [
        '^trackingId$', '^refId$', '^trk$', '^midToken$',
      ],
    },
    {
      name: 'Weibo',
      domains: ['weibo.com', 'weibo.cn'],
      params: ['^sudaref$', '^display$'],
    },
    {
      name: 'Sohu',
      domains: ['sohu.com'],
      params: ['^spm$', '^pvid$'],
    },
    {
      name: 'WeChat MP',
      domains: ['mp.weixin.qq.com'],
      params: [
        '^scene$', '^from_masonry$',
        '^sharer_shareinfo$', '^sharer_shareinfo_first$',
        '^poc_token$', '^chksm$', '^version$', '^ascene$',
        '^mpshare$', '^srcid$',
      ],
    },
  ],
};
