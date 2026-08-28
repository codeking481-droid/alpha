import { Link } from 'react-router-dom';

const plans = [
  { name:'Access', price:'$50', note:'one-time', bullets:['Access token (single-use, 30d)','Companies + outreach access','DM companies directly','Outcome proof'], cta:'Get access token', href:'/signup', featured:false },
  { name:'Premium', price:'$99', note:'one-time', bullets:['Premium token + priority','Everything in Access','Client dashboards','API & webhooks','Success manager'], cta:'Get premium access', href:'/signup', featured:true },
  { name:'Ad Engine', price:'$500', note:'/week', bullets:['1-week campaign (32 posts)','10 LinkedIn + 10 WhatsApp + 10 TG + 2 YT','Real audiences: 700/215/54/3k','Truth clause — no guarantees'], cta:'Book campaign', href:'/platform', featured:false },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="max-w-[1040px] mx-auto px-6" style={{background:'#FFFCF8', paddingTop:'120px', paddingBottom:'80px', maxWidth:'1040px'}}>
      <div className="text-center">
        <div style={{color:'#6B7280', fontSize:'11px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>ACCESS • PAY ONCE • OWN YOUR PIPELINE</div>
        <h2 className="font-semibold mt-2" style={{color:'#0A0A0A', fontSize:'28px', letterSpacing:'-0.02em'}}>No free access. <span style={{color:'#6B7280', fontStyle:'italic', fontWeight:400}}>Token only.</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10" style={{gap:'12px'}}>
        {plans.map(p=>(
          <div key={p.name} className="card flex flex-col" style={p.featured ? {background:'#0A0A0A', border:'1px solid #0A0A0A', borderRadius:'12px', padding:'24px'} : {background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'12px', padding:'24px'}}>
            <div style={{color: p.featured ? '#9CA3AF' : '#6B7280', fontSize:'11px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span style={{color: p.featured ? '#FFFFFF' : '#0A0A0A', fontSize:'24px', fontWeight:600}}>{p.price}</span>
              <span style={{color: p.featured ? '#6B7280' : '#6B7280', fontSize:'12px'}}>{p.note}</span>
            </div>
            <ul className="mt-5 space-y-2 flex-1">
              {p.bullets.map(b=>(
                <li key={b} className="flex gap-2 text-sm" style={{color: p.featured ? '#D1D5DB' : '#6B7280', fontSize:'13px'}}>
                  <span className="flex items-center justify-center shrink-0" style={{background: p.featured ? '#1A1A1A' : '#F5F5F5', width:'16px', height:'16px', borderRadius:'999px', color: p.featured ? '#FFFFFF' : '#0A0A0A', fontSize:'10px', marginTop:'2px'}}>✓</span>{b}
                </li>
              ))}
            </ul>
            <Link to={p.href} className="mt-6 text-center inline-flex items-center justify-center" style={p.featured ? {background:'#FFFFFF', color:'#0A0A0A', height:'36px', borderRadius:'8px', fontWeight:500, fontSize:'14px'} : {background:'#0A0A0A', color:'#FFFFFF', height:'36px', borderRadius:'8px', fontWeight:500, fontSize:'14px'}}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
