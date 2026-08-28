import { useState } from 'react';

const plans = [
  { name:'Starter', sub:'Solo founders', price:'$0', note:'/ forever', bullets:['3 companies','Free lead finder','Content Studio (Groq)','50 sends / month'], cta:'Start free', fill:false },
  { name:'Pro', sub:'$3k — $15k agencies', price:'$29', note:'/ month', bullets:['Unlimited companies & searches','Apollo + Overpass','Automation & inbox','Outcomes proof + charts','Deal Desk','Priority support'], cta:'Start Pro', fill:true, badge:'Most agencies start here' },
  { name:'Scale', sub:'Teams', price:'$99', note:'/ month', bullets:['Everything in Pro','White-label & domain','Client dashboards','API & webhooks','Success manager'], cta:'Scale agency', fill:false },
];

export const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-16 px-4 border-t border-white/5">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-2xl">
          <div className="eyebrow text-white/30">Pricing • No seat fees • Cancel anytime</div>
          <h2 className="text-3xl font-black tracking-tight text-white mt-3">Pay for outcomes, not seats.</h2>
          <p className="text-sm text-white/40 mt-2">Start free. Upgrade when the OS is earning. Annual saves 17%.</p>
        </div>

        <div className="inline-flex mt-6 p-1 rounded-full hairline bg-white/[0.03]">
          <button onClick={()=>setAnnual(false)} className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${!annual?'bg-white text-[#0B0215]':'text-white/50'}`}>Monthly</button>
          <button onClick={()=>setAnnual(true)} className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${annual?'bg-white text-[#0B0215]':'text-white/50'}`}>Annual • 2 months free</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
          {plans.map(p=>(
            <div key={p.name} className={`rounded-[20px] p-6 flex flex-col ${p.fill?'bg-white text-[#0B0215]':'mature-card'}`}>
              {p.badge && <div className="eyebrow text-[#0B0215]/50">{p.badge}</div>}
              <div className={`text-sm font-black tracking-widest uppercase ${p.fill?'text-[#0B0215]/50':'text-white/30'}`}>{p.name} • {p.sub}</div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className={`text-3xl font-black tracking-tight ${p.fill?'text-[#0B0215]':'text-white'}`}>{p.price}</span>
                <span className={`text-xs ${p.fill?'text-[#0B0215]/40':'text-white/30'}`}>{p.note}</span>
                {annual && p.price!=='$0' && <span className={`ml-2 text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full ${p.fill?'bg-[#0B0215] text-white':'bg-white text-[#0B0215]'}`}>Save 17%</span>}
              </div>
              <ul className="mt-5 space-y-2 flex-1">
                {p.bullets.map(b=>(
                  <li key={b} className={`flex gap-2 text-sm ${p.fill?'text-[#0B0215]/70':'text-white/60'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${p.fill?'bg-[#0B0215]/10':'bg-white/5 border border-white/10'}`}>✓</span> {b}
                  </li>
                ))}
              </ul>
              <a href="/dashboard" className={`mt-6 text-center py-3 rounded-full font-black text-xs tracking-widest uppercase ${p.fill?'bg-[#0B0215] text-white hover:bg-black':'bg-white text-[#0B0215] hover:bg-white/90'}`}>{p.cta}</a>
              <div className={`text-center text-[11px] mt-2 ${p.fill?'text-[#0B0215]/40':'text-white/25'}`}>No credit card • 2-min setup</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
