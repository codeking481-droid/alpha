// Alpha Community Database — real audiences for Outbound Campaigns
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
    members: 113,
    postsPerCampaign: 10
  },
  youtube: {
    subscribers: 3000,
    videosPerCampaign: 2
  }
};

export const COMMUNITIES = {
  TELEGRAM: { name: "Telegram Channel", members: 113 },
  YOUTUBE: { name: "YouTube", members: 3000, subscribers: "3K+" },
  WHATSAPP: { name: "WhatsApp Channel", members: 130 },
  CYBERSECURITY: { name: "Cybersecurity Community", members: 85 },
  LINKEDIN_FOLLOWERS: { name: "LinkedIn Followers", members: 700 },
  LINKEDIN_CONNECTIONS: { name: "LinkedIn Connections", members: 500 },
  TOTAL_AUDIENCE: 4528
};

export const TRUTH_CLAUSE =
  "We own 4,500+ audience: 3K+ YouTube, 700+ LinkedIn followers, 500+ connections, 130 WhatsApp channel, 113 Telegram channel, 85 cybersecurity. We reach out to brands and manage everything done-for-you for $500. $50 is tool-only DIY access, no community posting.";

export const PRICING = {
  oneWeekCampaign: {
    name: 'One-Week Campaign',
    price: 500,
    currency: 'USD',
    deliverables: { linkedin: 10, whatsapp: 10, telegram: 10, youtube: 2 },
    totalPosts: 40,
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