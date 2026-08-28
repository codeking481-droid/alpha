import { supabase } from '../../lib/supabase.js';

export const Hero = () => {
  const handleGoogle = async () => {
    if (import.meta.env.VITE_SUPABASE_URL) {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/access' } });
      if (error) window.location.href = '/auth';
    } else {
      window.location.href = '/auth';
    }
  };
  return (
    <section className="max-w-[1040px] mx-auto px-6 text-center" style={{background:'#FFFCF8', paddingTop:'120px', paddingBottom:'120px'}}>
      <div style={{color:'#6B7280', fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}} className="mb-6">
        PLATFORM • 6 MODULES • ONE OS
      </div>
      <h1 style={{color:'#0A0A0A', fontSize:'64px', fontWeight:700, letterSpacing:'-0.03em', lineHeight:'1.05'}}>
        The Invisible OS for<br />
        Modern Agencies<span style={{color:'#5E17EB'}}>.</span>
      </h1>
      <p className="mx-auto mt-6" style={{color:'#6B7280', fontSize:'20px', maxWidth:'640px', lineHeight:'1.6'}}>
        Find leads. Create content. Send outreach. Prove ROI. All from one platform. No noise. Just results.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button onClick={handleGoogle} className="inline-flex items-center justify-center" style={{background:'#5E17EB', color:'#FFFCF8', fontSize:'15px', fontWeight:600, letterSpacing:'0.01em', padding:'14px 28px', height:'48px', borderRadius:'8px', minWidth:'220px'}}>
          Sign up with Google →
        </button>
        <button
          onClick={() => {
            const dp = window.deferredPrompt || window.__alphaDeferredPrompt;
            if (dp) dp.prompt();
            else alert('Tap the share button and select "Add to Home Screen"');
          }}
          className="inline-flex items-center justify-center"
          style={{background:'#FFFFFF', color:'#0A0A0A', border:'1px solid #EDEDED', fontSize:'15px', fontWeight:500, letterSpacing:'0.01em', padding:'14px 28px', height:'48px', borderRadius:'8px', minWidth:'180px'}}
        >
          Download App
        </button>
      </div>
      <p className="mt-6" style={{color:'#6B7280', fontSize:'14px'}}>Free to start. Pay only when you deliver.</p>
    </section>
  );
};

export default Hero;
