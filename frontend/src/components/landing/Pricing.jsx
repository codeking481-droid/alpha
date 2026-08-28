const plans = [
  { name:'Access', sub:'Solo • $50 USD', price:'$50', note:'one-time', bullets:['Access token (single-use, 30d)','Companies + outreach access','DM companies directly','Outcome proof'], cta:'Get Access Token', href:'/checkout?price=50', dark:false },
  { name:'Premium Access', sub:'Most chosen • $99 USD', price:'$99', note:'one-time', bullets:['Premium token + priority','Everything in Access','Client dashboards','API & webhooks','Success manager'], cta:'Get Premium Access', href:'/checkout?price=99', featured:true },
  { name:'Ad Engine', sub:'Done-for-you • $500', price:'$500', note:'/week', bullets:['1-week campaign (32 posts)','10 LinkedIn + 10 WhatsApp + 10 TG + 2 YT','Real audiences: 700/215/54/3k','Truth clause — no view guarantees'], cta:'Book Campaign →', href:'/campaigns', accent:true },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-16 px-6" style={{background:'#FAFAFA', borderTop:'1px solid #EAEAEA'}}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="text-xs font-bold tracking-widest uppercase" style={{color:'#5E17EB'}}>Access • Pay once • Own your pipeline</div>
          <h2 className="text-3xl font-bold tracking-tight mt-3" style={{color:'#0A0A0A'}}>No free access. <span style={{color:'#5E17EB', fontStyle:'italic', fontWeight:400}}>Token only.</span></h2>
          <p className="text-sm mt-2" style={{color:'#777777'}}>Payment confirmed → access token issued instantly in USD via Paystack. No token, no company DM.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 max-w-6xl mx-auto">
          {plans.map(p=>(
            <div key={p.name} className="rounded-2xl p-6 flex flex-col hover-lift" style={p.featured ? {background:'#0A0A0A', color:'#FFFFFB'} : p.accent ? {background:'#FFFFFB', border:'2px solid #5E17EB'} : {background:'#FFFFFB', border:'1px solid #EAEAEA'}}>
              {p.featured && <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{color:'#7A3FEF'}}>Most chosen</div>}
              {p.accent && <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{color:'#5E17EB'}}>Ad Engine • Real reach</div>}
              <div className="text-sm font-bold tracking-widest uppercase" style={{color: p.featured ? '#999999' : '#777777'}}>{p.name} • {p.sub}</div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-3xl font-bold tracking-tight" style={{color: p.featured ? '#FFFFFB' : '#0A0A0A'}}>{p.price}</span>
                <span className="text-xs" style={{color: p.featured ? '#999999' : '#777777'}}>{p.note}</span>
              </div>
              <ul className="mt-5 space-y-2 flex-1">
                {p.bullets.map(b=>(
                  <li key={b} className="flex gap-2 text-sm" style={{color: p.featured ? '#CCCCCC' : '#555555'}}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5" style={p.featured ? {background:'#5E17EB', color:'#FFFFFB'} : p.accent ? {background:'rgba(94,23,235,0.1)', color:'#5E17EB'} : {background:'#F5F5F5', border:'1px solid #EAEAEA'}}>✓</span> {b}
                  </li>
                ))}
              </ul>
              <a href={p.href} className="mt-6 text-center py-3 rounded-lg font-bold text-sm" style={p.featured ? {background:'#5E17EB', color:'#FFFFFB'} : p.accent ? {background:'#5E17EB', color:'#FFFFFB'} : {background:'#0A0A0A', color:'#FFFFFB'}}>{p.cta}</a>
              <div className="text-center text-xs mt-2" style={{color: p.featured ? '#777777' : '#999999'}}>{p.accent ? 'Real communities — no view guarantees' : 'Paystack USD • Token after success'}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs mt-6 max-w-3xl mx-auto leading-5" style={{color:'#999999'}}>🔒 Truth Clause: We have real communities, not bots. 32 posts delivered to real people. We do not guarantee views, likes, or conversions. We guarantee delivery.</p>
      </div>
    </section>
  );
};

export default Pricing;
