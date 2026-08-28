import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <div className="inline-block bg-violet/10 text-violet px-4 py-1.5 rounded-full text-sm font-medium tracking-wide mb-6" style={{background:'rgba(94,23,235,0.08)', color:'#5E17EB'}}>
        Alpha Agency OS
      </div>
      <h1 className="text-5xl sm:text-6xl font-bold text-black tracking-tight leading-[1.1]" style={{color:'#0A0A0A'}}>
        The Invisible OS for<br />
        <span style={{color:'#5E17EB'}}>Modern Agencies</span>
      </h1>
      <p className="text-lg max-w-2xl mx-auto mt-6" style={{color:'#555555'}}>
        Find leads. Create content. Send outreach. Prove ROI.
        All from one platform. No noise. Just results.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link to="/auth" className="btn-primary text-lg px-10 py-4" style={{background:'#5E17EB', color:'#FFFFFB'}}>
          Get Started →
        </Link>
        <Link to="/auth" className="btn-outline text-lg px-10 py-4" style={{color:'#5E17EB', borderColor:'#5E17EB'}}>
          View Pricing
        </Link>
      </div>
      <p className="text-sm mt-6" style={{color:'#999999'}}>
        Free to start. Pay only when you deliver.
      </p>
    </section>
  );
};

export default Hero;
