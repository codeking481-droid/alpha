// Alpha Community Database — real audiences for One-Week Campaigns
export const COMMUNITY = {
  linkedin: {
    followers: 700,
    connections: 500,
    postsPerCampaign: 10,
    label: 'LinkedIn',
    totalReach: 700,
    url: 'https://linkedin.com/in/alphatekx',
  },
  whatsapp: {
    groups: [
      { name: 'Main', members: 130, invite: '' },
      { name: 'Cyber Security', members: 85, invite: '' },
    ],
    postsPerCampaign: 10,
    label: 'WhatsApp',
    get totalMembers() { return this.groups.reduce((s,g)=>s+g.members, 0); },
  },
  telegram: {
    members: 54,
    postsPerCampaign: 10,
    label: 'Telegram',
    channel: 'https://t.me/alphatekx',
  },
  youtube: {
    subscribers: 3000,
    videosPerCampaign: 2,
    label: 'YouTube',
    channel: 'https://youtube.com/@alphatekx',
  },
};

export const PRICING = {
  oneWeekCampaign: {
    name: 'One-Week Campaign',
    price: 500,
    currency: 'USD',
    deliverables: {
      linkedin: 10,
      whatsapp: 10,
      telegram: 10,
      youtube: 2,
    },
    totalPosts: 32,
    billingCycle: 'per campaign (7 days)',
  },
};

export function getTotalReach() {
  return {
    linkedin: COMMUNITY.linkedin.followers + COMMUNITY.linkedin.connections,
    whatsapp: COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0),
    telegram: COMMUNITY.telegram.members,
    youtube: COMMUNITY.youtube.subscribers,
    combined: COMMUNITY.linkedin.followers + COMMUNITY.linkedin.connections + COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0) + COMMUNITY.telegram.members + COMMUNITY.youtube.subscribers,
  };
}

export function getCampaignDeliverables() {
  return {
    ...PRICING.oneWeekCampaign.deliverables,
    total: PRICING.oneWeekCampaign.totalPosts,
    price: PRICING.oneWeekCampaign.price,
    breakdown: [
      { platform: 'LinkedIn', count: 10, audience: `${COMMUNITY.linkedin.followers}+ followers` },
      { platform: 'WhatsApp', count: 10, audience: `${COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0)} members (2 groups)` },
      { platform: 'Telegram', count: 10, audience: `${COMMUNITY.telegram.members} members` },
      { platform: 'YouTube', count: 2, audience: `${COMMUNITY.youtube.subscribers}+ subscribers` },
    ],
  };
}
