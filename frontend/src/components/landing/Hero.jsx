import { Link } from 'react-router-dom';

export const Hero = () => {
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
        <Link to="/auth" className="inline-flex items-center justify-center" style={{background:'#5E17EB', color:'#FFFFFF', fontSize:'15px', fontWeight:600, letterSpacing:'0.01em', padding:'14px 28px', height:'48px', borderRadius:'8px', minWidth:'220px', textDecoration:'none'}}>
          Sign up with Google →
        </Link>
        <button
          onClick={() => {
            const dp = window.__alphaDeferredPrompt;
            if (dp && dp.prompt) dp.prompt();
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
