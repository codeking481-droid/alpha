import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="max-w-[1120px] mx-auto px-6 py-20 text-center" style={{background:'#FFFCF8'}}>
      <div className="label mb-6" style={{color:'#6B7280', letterSpacing:'0.08em', fontSize:'12px', fontWeight:500}}>PLATFORM • 6 MODULES • ONE OS</div>
      <h1 className="font-semibold leading-tight" style={{color:'#0A0A0A', fontSize:'56px', letterSpacing:'-0.02em'}}>
        The Invisible OS for<br />
        <span style={{color:'#0A0A0A', borderBottom:'3px solid #5E17EB', paddingBottom:'2px'}}>Modern Agencies</span>
      </h1>
      <p className="mx-auto mt-6" style={{color:'#6B7280', fontSize:'18px', maxWidth:'560px', lineHeight:'1.6'}}>
        Find leads. Create content. Send outreach. Prove ROI. All from one platform. No noise. Just results.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link to="/signup" className="btn-primary" style={{background:'#0A0A0A', height:'44px', padding:'0 24px', borderRadius:'8px'}}>
          Get Access Token →
        </Link>
        <Link to="/platform" className="btn-secondary" style={{height:'44px', borderRadius:'8px'}}>
          View Platform
        </Link>
      </div>
      <p className="mt-4" style={{color:'#6B7280', fontSize:'13px'}}>Free to start. Pay only when you deliver.</p>
    </section>
  );
};

export default Hero;
