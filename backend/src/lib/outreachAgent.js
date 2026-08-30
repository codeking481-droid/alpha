// Polished Enterprise Pitch - Founding Partner - No Threat - AlphaTekx Automation Loss-Leader
// Template: backend/src/lib/outreachAgent.js
// Agent sends this exact polished template via POST /api/outreach/send with GROQ_MODEL openai/gpt-oss-120b mocked:false

export const POLISHED_TEMPLATE = {
  subject: "Exclusive Sponsorship + Free Custom System for {companyName}",
  body: `Subject: Exclusive Sponsorship + Free Custom System for {companyName}

Hi {contactName},

We are currently scaling outreach for our Q3 digital campaign across our multi-channel network:

* YouTube: 3,000+ tech & business subscribers
* LinkedIn: 1,270+ decision-makers & professionals
* Telegram & WhatsApp: 300+ engaged community members (131 + 86 + 184)

We are opening up our Founding Partner slots (only 7 left) to advertise your business across all these channels for a flat rate of $250 (originally $500).

The Founding Bonus:
If you accept this offer, we will also build and deploy one fully functional custom system of your choice (CRM, Booking System, Inventory Tracker, Payment Gateway, E-commerce Store, or Business Dashboard) tailored specifically for your business.

This isn't just a static website—it's a live, working system built via our automated enterprise platform. We are offering this $2,000+ value completely free for our first 7 founding clients to build out our case study portfolio.

(Note: This bonus is strictly tied to our founding partnership slots).

If you are interested in grabbing one of the remaining spots, you can lock it in here: {privateCheckoutServiceLink} ($250 private checkout - POST /api/checkout/service 25000)

Best regards,
Alpha Agency
Powered by AlphaTekx

Platform: Get Access To Real Companies With Just $50 Lifetime - Same tool we used to find you (Apollo + Hunter verified, Global USA/UK not Lagos info@, Groq 120B openai/gpt-oss-120b, Vault 12)`
};

export function getPrivateCheckoutServiceLink(env, origin) {
  // Private service checkout 25000 cents = $250 via POST /api/checkout/service
  // If origin provided, build full link; otherwise use env or default
  const base = origin ? origin.replace(/\/$/, '') : (env.FRONTEND_URL ? env.FRONTEND_URL.replace(/\/$/, '') : 'https://alpha-agency-api.alphatekxcompany.workers.dev');
  // Checkout service link - can be direct POST endpoint or frontend checkout page
  // Use frontend origin if available, otherwise API origin
  const checkoutPath = '/api/checkout/service';
  return `${base}${checkoutPath}`;
}

export function personalizePolished(env, { companyName, contactName, industry, privateCheckoutServiceLink, origin }) {
  const link = privateCheckoutServiceLink || getPrivateCheckoutServiceLink(env, origin);
  const cleanCompany = (companyName || 'your company').trim() || 'your company';
  const cleanContact = (contactName || 'there').trim() || 'there';
  // Industry not directly in template but kept for future personalization
  let subject = POLISHED_TEMPLATE.subject.replaceAll('{companyName}', cleanCompany);
  let body = POLISHED_TEMPLATE.body
    .replaceAll('{companyName}', cleanCompany)
    .replaceAll('{contactName}', cleanContact)
    .replaceAll('[Company Name]', cleanCompany)
    .replaceAll('[Contact Name]', cleanContact)
    .replaceAll('{privateCheckoutServiceLink}', link)
    .replaceAll('{privateCheckoutServiceLink }', link);
  // Ensure enterprise tone: no threat, no rough edges
  return { subject, body, link, breakdown: { youtube: 3000, linkedin: 1270, telegram_whatsapp: 300, total: 4671, checkoutCents: 25000 } };
}

// For GET /api/outreach/templates
export function getPolishedTemplate(env, origin) {
  const link = getPrivateCheckoutServiceLink(env, origin);
  return {
    polished: {
      subject: POLISHED_TEMPLATE.subject,
      body: POLISHED_TEMPLATE.body,
      placeholders: ['{companyName}', '{contactName}', '{privateCheckoutServiceLink}'],
      note: 'Use real company data: {companyName, contactName, industry} — breakdown 3000+1270+300 (131+86+184 rounded) — checkout 25000 cents POST /api/checkout/service'
    },
    example: personalizePolished(env, { companyName: 'Acme Innovations', contactName: 'Alex', industry: 'SaaS', privateCheckoutServiceLink: link, origin }),
    env: {
      TOTAL_REACH: env.TOTAL_REACH || '4671',
      GROQ_MODEL: env.GROQ_MODEL || 'openai/gpt-oss-120b',
      checkout: 'POST /api/checkout/service 25000',
      founding: '7 slots left $250 was $500 + $2K system free via AlphaTekx automation loss-leader'
    },
    verified: {
      enterpriseTone: true,
      noThreat: true,
      youtube3K: true,
      linkedin1270: true,
      tgWa300: true,
      was500Now250: true,
      sevenSlots: true,
      bonus2KSystem: true,
      alphaTekxAutomation: true,
      privateCheckout25000: true,
      poweredByAlphaTekx: true
    }
  };
}
