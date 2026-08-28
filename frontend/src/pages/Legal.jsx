import { useParams } from 'react-router-dom';

export const Legal = () => {
  const { type } = useParams();
  const isPrivacy = type === 'privacy';
  return (
    <div style={{background:'#FFFCF8', minHeight:'100vh'}}>
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <div className="label" style={{color:'#6B7280'}}>LEGAL • {isPrivacy ? 'PRIVACY' : 'TERMS'}</div>
        <h1 className="font-semibold mt-2" style={{color:'#0A0A0A', fontSize:'32px'}}>{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h1>
        <div className="mt-6 space-y-4 text-sm leading-6" style={{color:'#6B7280'}}>
          <p>Alpha Agency OS — The Invisible OS for Modern Agencies. We store only what you provide. Tokens are single-use, 30-day expiry. Paystack handles payments in USD ($50/$99) — we never store card data.</p>
          <p>Real communities: 700 LinkedIn, 215 WhatsApp (130+85), 54 Telegram, 3k YouTube. We do not guarantee views, likes, or conversions. We guarantee delivery to real people.</p>
          <p>Contact: alphatekxcompany@gmail.com • alphatekx.name.ng</p>
          <p className="text-xs" style={{color:'#9CA3AF'}}>Last updated: Aug 2026 • Pure brand • Built to scale for millions.</p>
        </div>
      </div>
    </div>
  );
};
export default Legal;
