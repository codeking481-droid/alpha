import { Link } from 'react-router-dom';

const plans = [
  { name:'Access', price:'$50', note:'one-time • token', bullets:['Access token (single-use, 30d)','Companies + outreach access','DM companies directly','Outcome proof — real ROI'], cta:'Buy $50 token', href:'/checkout?price=50', featured:false },
  { name:'Premium', price:'$99', note:'one-time • premium token', bullets:['Premium token + priority','Everything in Access','Client dashboards','API & webhooks','Success manager'], cta:'Buy $99 premium', href:'/checkout?price=99', featured:true },
  { name:'Ad Engine', price:'$500', note:'/week • done-for-you', bullets:['1-week campaign (32 posts)','10 LinkedIn + 10 WhatsApp + 10 TG + 2 YT','Real audiences: 700/215/54/3k','Truth clause — no guarantees'], cta:'Book campaign', href:'/platform', featured:false },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="max-w-[1040px] mx-auto px-6" style={{background:'#FFFCF8', paddingTop:'80px', paddingBottom:'80px'}}>
      <div className="text-center">
        <div style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase'}}>ACCESS • PAY ONCE • OWN YOUR PIPELINE</div>
        <h2 className="font-semibold mt-3" style={{color:'#0A0A0A', fontSize:'34px', letterSpacing:'-0.03em', lineHeight:'1.1'}}>No free access. <span style={{color:'#5E17EB', fontWeight:700}}>Token only.</span></h2>
        <p className="mx-auto mt-3" style={{color:'#6B7280', fontSize:'14px', maxWidth:'560px'}}>After instant signup you land on <span style={{color:'#0A0A0A', fontWeight:600}}>Enter Access Token</span>. Only token holders unlock the OS. Buy your token below — instant issue after Paystack success.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10" style={{gap:'16px'}}>
        {plans.map(p=>(
          <div key={p.name} className="card flex flex-col" style={p.featured ? {background:'#FFFFFF', border:'2px solid #5E17EB', borderRadius:'16px', padding:'28px'} : {background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'16px', padding:'28px'}}>
            {p.featured && <div className="flex items-center gap-1.5 mb-2"><span style={{width:'6px', height:'6px', borderRadius:'999px', background:'#5E17EB', display:'inline-block'}} /><span style={{color:'#5E17EB', fontSize:'11px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase'}}>MOST CHOSEN</span></div>}
            <div style={{color: '#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span style={{color: '#0A0A0A', fontSize:'30px', fontWeight:800, letterSpacing:'-0.03em'}}>{p.price}</span>
              <span style={{color: '#6B7280', fontSize:'12px', fontWeight:500}}>{p.note}</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.bullets.map(b=>(
                <li key={b} className="flex gap-2" style={{color: '#6B7280', fontSize:'13.5px', lineHeight:'1.5'}}>
                  <span className="flex items-center justify-center shrink-0" style={{background:'#F5F3FF', width:'18px', height:'18px', borderRadius:'999px', color:'#5E17EB', fontSize:'11px', fontWeight:700, marginTop:'1px'}}>✓</span>{b}
                </li>
              ))}
            </ul>
            <Link to={p.href} className="mt-6 text-center inline-flex items-center justify-center" style={{background: p.featured ? '#5E17EB' : '#0A0A0A', color:'#FFFFFF', height:'44px', borderRadius:'8px', fontWeight:700, fontSize:'13px', textDecoration:'none'}}>{p.cta}</Link>
          </div>
        ))}
      </div>
      <p className="text-center mt-6" style={{color:'#9CA3AF', fontSize:'12px'}}>Paystack USD • Token issued instantly after success • Questions? <a href="mailto:alphatekxcompany@gmail.com" style={{color:'#5E17EB', fontWeight:700}}>alphatekxcompany@gmail.com</a></p>
    </section>
  );
};

export default Pricing;
