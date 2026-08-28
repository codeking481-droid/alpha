import { Link, useNavigate } from 'react-router-dom';

function doInstantSignup() {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('alpha.token');
  if (token) return token;
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  const payload = (() => { try { return btoa(JSON.stringify({ sub: id, email: `user-${id.slice(0,8)}@alpha.local`, role: 'member', iat: Date.now() })) } catch { return 'eyJzdWIiOiJpbnN0YW50In0' } })();
  token = `instant-jwt.${payload}.sig`;
  localStorage.setItem('alpha.token', token);
  localStorage.setItem('alpha.user', JSON.stringify({ email: `user-${id.slice(0,8)}@alpha.local`, role: 'member', instant: true }));
  localStorage.setItem('alpha.signup_at', new Date().toISOString());
  try { window.dispatchEvent(new Event('storage')); } catch {}
  return token;
}

export const Hero = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    const hasAccess = localStorage.getItem('alpha.access_granted') === '1';
    if (hasAccess) { navigate('/dashboard'); return; }
    doInstantSignup();
    // instant signup → straight to access token gate
    navigate('/access');
    try { window.showAlphaToast && window.showAlphaToast('Welcome — enter your access token to unlock', 'success'); } catch {}
  };
  return (
    <section className="max-w-[1040px] mx-auto px-6 text-center" style={{background:'#FFFCF8', paddingTop:'140px', paddingBottom:'100px'}}>
      <div style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase'}} className="mb-8">
        PLATFORM • 6 MODULES • ONE OS — BUILT FOR OPERATORS
      </div>
      <h1 style={{color:'#0A0A0A', fontSize:'clamp(36px, 6vw, 72px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:'0.95'}}>
        The Invisible OS<br />
        for Modern Agencies<span style={{color:'#5E17EB'}}>.</span>
      </h1>
      <p className="mx-auto mt-6" style={{color:'#6B7280', fontSize:'19px', maxWidth:'680px', lineHeight:'1.6'}}>
        Find leads. Create content. Send outreach. Prove ROI.<br />
        <span style={{color:'#0A0A0A', fontWeight:600}}>All from one platform. No noise. Just results.</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button
          onClick={handleGetStarted}
          className="inline-flex items-center justify-center font-semibold"
          style={{background:'#5E17EB', color:'#FFFFFF', fontSize:'16px', fontWeight:800, letterSpacing:'-0.02em', padding:'16px 32px', height:'52px', borderRadius:'10px', minWidth:'260px', border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(94,23,235,0.25)'}}
        >
          Sign Up — Instant, Free →
        </button>
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center"
          style={{background:'#FFFFFF', color:'#0A0A0A', border:'1px solid #EDEDED', fontSize:'15px', fontWeight:600, padding:'16px 28px', height:'52px', borderRadius:'10px', minWidth:'180px', textDecoration:'none'}}
        >
          View Plans — $50 / $99
        </Link>
      </div>
      <p className="mt-4 flex items-center justify-center gap-2" style={{color:'#5E17EB', fontSize:'12px', fontWeight:600}}>
        <span style={{width:'6px', height:'6px', borderRadius:'999px', background:'#10B981', display:'inline-block'}} /> No form. 1-click signup → instant token gate.
      </p>
      <p className="mt-6" style={{color:'#6B7280', fontSize:'13px'}}>Free to sign up. <span style={{color:'#0A0A0A', fontWeight:700}}>Access token unlocks everything.</span> Only token holders get in.</p>
    </section>
  );
};

export default Hero;
