import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="max-w-[1040px] mx-auto px-6 text-center" style={{background:'#FFFCF8', paddingTop:'80px', paddingBottom:'80px'}}>
      <div style={{color:'#6B7280', fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}} className="mb-6">
        PLATFORM • 6 MODULES • ONE OS
      </div>
      <h1 style={{color:'#0A0A0A', fontSize:'48px', fontWeight:650, letterSpacing:'-0.03em', lineHeight:'1.05'}}>
        The Invisible OS for<br />
        Modern Agencies<span style={{color:'#5E17EB'}}>.</span>
      </h1>
      <p className="mx-auto mt-6" style={{color:'#6B7280', fontSize:'18px', maxWidth:'560px', lineHeight:'1.6'}}>
        Find leads. Create content. Send outreach. Prove ROI. All from one platform. No noise. Just results.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link to="/auth" className="inline-flex items-center justify-center" style={{background:'#0A0A0A', color:'#FFFCF8', fontSize:'14px', fontWeight:500, letterSpacing:'0.01em', padding:'12px 20px', height:'44px', borderRadius:'8px', textTransform:'none'}}>
          Sign up with Google →
        </Link>
        <button
          onClick={() => {
            const dp = window.deferredPrompt || window.__alphaDeferredPrompt;
            if (dp) dp.prompt();
            else alert('Tap the share button and select "Add to Home Screen"');
          }}
          className="inline-flex items-center justify-center"
          style={{background:'#FFFFFF', color:'#0A0A0A', border:'1px solid #E8E8E8', fontSize:'14px', fontWeight:500, letterSpacing:'0.01em', padding:'12px 20px', height:'44px', borderRadius:'8px'}}
        >
          Download App
        </button>
      </div>
      <p className="mt-4" style={{color:'#6B7280', fontSize:'13px'}}>Free to start. Pay only when you deliver.</p>
    </section>
  );
};

export default Hero;
