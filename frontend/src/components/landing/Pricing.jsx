import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/ forever',
    desc: 'For solo founders proving demand',
    features: ['3 companies', 'Free lead finder (50/search)', 'Content Studio — AI (Groq)', 'Outreach • 50 sends/mo', 'Community support'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    desc: 'For agencies doing $3k–$15k',
    features: ['Unlimited companies & leads', 'Advanced search + Apollo gmail', 'Outreach automation & inbox', 'Analytics + Outcome proof', 'Deal Desk + invoices', 'Priority support'],
    cta: 'Start Pro — most popular',
    highlight: true,
  },
  {
    name: 'Scale',
    price: '$99',
    period: '/mo',
    desc: 'For teams & white-label',
    features: ['Everything in Pro', 'White-label + custom domain', 'Client dashboards (read-only)', 'API + webhooks', 'Success manager'],
    cta: 'Scale agency',
    highlight: false,
  },
];

export const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-16 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Simple. No seat fees. <span className="text-gold">Cancel anytime.</span></h2>
          <p className="text-white/50 mt-3">Start free. Upgrade when you need more firepower. All plans include outcomes + client dashboard.</p>
          <div className="inline-flex items-center gap-2 mt-6 p-1 rounded-full bg-white/5 border border-white/10">
            <button onClick={()=>setAnnual(false)} className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${!annual?'bg-white text-[#0B0215]':'text-white/60'}`}>Monthly</button>
            <button onClick={()=>setAnnual(true)} className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${annual?'bg-[#FFD700] text-[#0B0215]':'text-white/60'}`}>Annual <span className="opacity-60">• 2 months free</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {plans.map((p, i) => (
            <div key={i} className={`relative glass rounded-[20px] p-6 sm:p-7 flex flex-col ${p.highlight ? 'border-gold/50 shadow-gold scale-[1.02] bg-white/[0.06]' : ''}`}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FFD700] text-[#0B0215] text-[11px] font-black tracking-widest uppercase">Most Popular • Best for ROI</span>}
              <h3 className="text-lg font-black tracking-tight text-white">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">{annual && p.price!=='$0' ? p.price.replace('$',' $'):p.price}</span>
                <span className="text-white/40 text-xs">{p.period}</span>
                {annual && p.price!=='$0' && <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Save 17%</span>}
              </div>
              <p className="text-white/40 text-xs mt-1">{p.desc}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.features.map(f=>(
                  <li key={f} className="flex gap-2 text-sm text-white/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] shrink-0 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/dashboard" className={`mt-7 block text-center py-3 rounded-xl font-black tracking-widest uppercase text-xs ${p.highlight ? 'bg-[#FFD700] text-[#0B0215] hover:bg-[#ffdf33]' : 'bg-white text-[#0B0215] hover:bg-white/90'}`}>
                {p.cta}
              </a>
              <p className="text-center text-[11px] text-white/20 mt-3">No credit card • 2-min setup</p>
            </div>
          ))}
        </div>

        <div className="mt-6 glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
          <span className="text-white/60">30-day money-back •</span>
          <span className="text-white/40">If you don’t find 30 leads in 30 days, we refund. No Q.</span>
          <a href="/dashboard" className="ml-2 text-[#FFD700] font-black tracking-widest uppercase hover:underline">Try free →</a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
