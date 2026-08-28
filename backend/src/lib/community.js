// Alpha Community Database — real audiences for One-Week Campaigns
export const COMMUNITY = {
  linkedin: {
    followers: 700,
    connections: 500,
    postsPerCampaign: 10
  },
  whatsapp: {
    groups: [
      { name: 'Main Group', members: 130 },
      { name: 'Cyber Security', members: 85 }
    ],
    postsPerCampaign: 10
  },
  telegram: {
    members: 54,
    postsPerCampaign: 10
  },
  youtube: {
    subscribers: 3000,
    videosPerCampaign: 2
  }
};

export const TRUTH_CLAUSE =
  "We have real communities, not bots. " +
  "LinkedIn (700 followers, 500+ connections): 10 posts. " +
  "WhatsApp (215+ members across 2 groups): 10 posts. " +
  "Telegram (54 members): 10 posts. " +
  "YouTube (3,000+ subscribers): 2 videos. " +
  "We do not guarantee views, likes, or conversions. " +
  "We guarantee we will deliver the content to real people who have chosen to follow us. " +
  "The rest is organic.";

// Helpers — not required by prompt but used by engine
export const PRICING = {
  oneWeekCampaign: {
    name: 'One-Week Campaign',
    price: 500,
    currency: 'USD',
    deliverables: { linkedin: 10, whatsapp: 10, telegram: 10, youtube: 2 },
    totalPosts: 32,
    billingCycle: 'per campaign (7 days)'
  }
};

export function getTotalReach() {
  return {
    linkedin: COMMUNITY.linkedin.followers + COMMUNITY.linkedin.connections,
    whatsapp: COMMUNITY.whatsapp.groups.reduce((s, g) => s + g.members, 0),
    telegram: COMMUNITY.telegram.members,
    youtube: COMMUNITY.youtube.subscribers,
    combined: COMMUNITY.linkedin.followers + COMMUNITY.linkedin.connections + COMMUNITY.whatsapp.groups.reduce((s, g) => s + g.members, 0) + COMMUNITY.telegram.members + COMMUNITY.youtube.subscribers
  };
}

export function getCampaignDeliverables() {
  return {
    ...PRICING.oneWeekCampaign.deliverables,
    total: PRICING.oneWeekCampaign.totalPosts,
    price: PRICING.oneWeekCampaign.price,
    breakdown: [
      { platform: 'LinkedIn', count: 10, audience: `${COMMUNITY.linkedin.followers} followers, ${COMMUNITY.linkedin.connections}+ connections` },
      { platform: 'WhatsApp', count: 10, audience: `${COMMUNITY.whatsapp.groups.reduce((s, g) => s + g.members, 0)}+ members (2 groups)` },
      { platform: 'Telegram', count: 10, audience: `${COMMUNITY.telegram.members} members` },
      { platform: 'YouTube', count: 2, audience: `${COMMUNITY.youtube.subscribers}+ subscribers` }
    ]
  };
}
