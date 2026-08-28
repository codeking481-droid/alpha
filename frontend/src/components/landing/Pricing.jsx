import { Link } from 'react-router-dom';

const plans = [
  { name:'Access Solo', price:'$50', note:'one-time', bullets:['Access token (single-use, 30d)','Companies + outreach access','DM companies directly','Outcome proof'], cta:'Get Access Token', href:'/signup', featured:false },
  { name:'Premium Access', price:'$99', note:'one-time', bullets:['Premium token + priority','Everything in Access','Client dashboards','API & webhooks','Success manager'], cta:'Get Premium Access', href:'/signup', featured:true },
  { name:'Ad Engine', price:'$500', note:'/week', bullets:['1-week campaign (32 posts)','10 LinkedIn + 10 WhatsApp + 10 TG + 2 YT','Real audiences: 700/215/54/3k','Truth clause — no guarantees'], cta:'Book Campaign', href:'/platform', accent:true },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="max-w-[1120px] mx-auto px-6 py-16" style={{background:'#FFFCF8'}}>
      <div className="text-center">
        <div className="label" style={{color:'#6B7280'}}>ACCESS • PAY ONCE • OWN YOUR PIPELINE</div>
        <h2 className="font-semibold mt-2" style={{color:'#0A0A0A', fontSize:'32px'}}>No free access. <span style={{color:'#6B7280', fontStyle:'italic', fontWeight:400}}>Token only.</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {plans.map(p=>(
          <div key={p.name} className="card flex flex-col" style={p.featured ? {background:'#0A0A0A', border:'1px solid #0A0A0A'} : p.accent ? {background:'#FFFCF8', border:'1px solid #5E17EB'} : {background:'#FFFCF8', border:'1px solid #EDEDED'}}>
            {p.featured && <div className="flex items-center gap-1.5 mb-3"><span className="dot-violet" /><span className="label" style={{color:'#FFFFFF', fontSize:'11px'}}>MOST CHOSEN</span></div>}
            {p.accent && <div className="label mb-3" style={{color:'#5E17EB', fontSize:'11px'}}>VIOLET BORDER • REAL REACH</div>}
            <div className="label" style={{color: p.featured ? '#9CA3AF' : '#6B7280'}}>{p.name} • {p.note}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-semibold" style={{color: p.featured ? '#FFFFFB' : '#0A0A0A', fontSize:'28px'}}>{p.price}</span>
              <span className="text-xs" style={{color: p.featured ? '#6B7280' : '#6B7280'}}>{p.note}</span>
            </div>
            <ul className="mt-5 space-y-2 flex-1">
              {p.bullets.map(b=>(
                <li key={b} className="flex gap-2 text-sm" style={{color: p.featured ? '#E5E7EB' : '#6B7280'}}><span style={{color: p.featured ? '#5E17EB' : '#0A0A0A'}}>✓</span>{b}</li>
              ))}
            </ul>
            <Link to={p.href} className="mt-6 text-center" style={p.featured ? {background:'#FFFFFB', color:'#0A0A0A', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', fontWeight:600, fontSize:'14px'} : {background:'#0A0A0A', color:'#FFFFFB', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', fontWeight:600, fontSize:'14px'}}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
