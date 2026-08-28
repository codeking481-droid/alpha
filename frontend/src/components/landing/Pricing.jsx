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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12" style={{gap:'16px'}}>
        {plans.map(p=>(
          <div key={p.name} className="card flex flex-col" style={p.featured ? {background:'#FFFFFF', border:'2px solid #5E17EB', borderRadius:'16px', padding:'32px'} : {background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'16px', padding:'32px'}}>
            {p.featured && <div className="flex items-center gap-1.5 mb-2"><span style={{width:'6px', height:'6px', borderRadius:'999px', background:'#5E17EB', display:'inline-block'}} /><span style={{color:'#5E17EB', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>MOST CHOSEN</span></div>}
            <div style={{color: '#6B7280', fontSize:'11px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span style={{color: '#0A0A0A', fontSize:'28px', fontWeight:700, letterSpacing:'-0.02em'}}>{p.price}</span>
              <span style={{color: '#6B7280', fontSize:'13px'}}>{p.note}</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.bullets.map(b=>(
                <li key={b} className="flex gap-2" style={{color: '#6B7280', fontSize:'14px'}}>
                  <span className="flex items-center justify-center shrink-0" style={{background:'#F5F5F5', width:'18px', height:'18px', borderRadius:'999px', color:'#0A0A0A', fontSize:'11px', marginTop:'1px'}}>✓</span>{b}
                </li>
              ))}
            </ul>
            <Link to={p.href} className="mt-8 text-center inline-flex items-center justify-center" style={{background:'#5E17EB', color:'#FFFFFF', height:'44px', borderRadius:'8px', fontWeight:600, fontSize:'14px'}}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
