import { useState } from 'react';

const plans = [
  { name:'Access', sub:'Single token • $50', price:'$50', note:'one-time', bullets:['Access token (single-use, 30d)','Companies + outreach access','DM companies directly','Outcome proof'], cta:'Get Access Token', fill:false },
  { name:'Premium Access', sub:'Best for pros • $99', price:'$99', note:'one-time', bullets:['Premium token + priority','Everything in Access','Client dashboards','API & webhooks','Success manager'], cta:'Get Premium Access', fill:true, badge:'Most chosen' },
];

export const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-16 px-4 border-t border-white/5">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-2xl">
          <div className="eyebrow text-white/30">Access • Pay once • Own your pipeline</div>
          <h2 className="text-3xl font-black tracking-tight text-white mt-3">No free access. <span className="text-white/40 font-normal mature-serif italic">Token only.</span></h2>
          <p className="text-sm text-white/40 mt-2">Payment confirmed → access token issued instantly. Admin gives tokens after verification. No token, no company DM.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
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
              <a href="/checkout?price=50" onClick={(e)=>{ if(p.price==='$99'){e.preventDefault(); window.location.href='/checkout?price=99';} else {e.preventDefault(); window.location.href='/checkout?price=50';}}} className={`mt-6 text-center py-3 rounded-full font-black text-xs tracking-widest uppercase ${p.fill?'bg-[#0B0215] text-white hover:bg-black':'bg-white text-[#0B0215] hover:bg-white/90'}`}>{p.cta}</a>
              <div className={`text-center text-[11px] mt-2 ${p.fill?'text-[#0B0215]/40':'text-white/25'}`}>Paystack • Token after verified payment</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
