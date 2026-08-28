import { Features } from '../components/landing/Features';

export const Platform = () => {
  return (
    <div style={{background:'#FFFCF8', minHeight:'100vh'}}>
      <div className="max-w-[1120px] mx-auto px-6 py-12">
        <div className="label" style={{color:'#6B7280'}}>PLATFORM • DEEP DIVE</div>
        <h1 className="font-semibold mt-2" style={{color:'#0A0A0A', fontSize:'40px', letterSpacing:'-0.02em'}}>Every module, quiet & fast.</h1>
        <p className="mt-3" style={{color:'#6B7280', fontSize:'16px', maxWidth:'640px'}}>Six modules, one OS. Each is empty until you add. No sample data. No theatre. Built for operators who ship.</p>
      </div>
      <Features />
      <div className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="card" style={{background:'#0A0A0A', border:'1px solid #0A0A0A'}}>
          <h3 style={{color:'#FFFFFB', fontSize:'18px', fontWeight:600}}>The OS is invisible. The results are not.</h3>
          <p className="mt-2" style={{color:'#9CA3AF', fontSize:'14px'}}>Ad Engine • Real reach 700/215/54/3k • Truth clause — no view guarantees, real delivery.</p>
        </div>
      </div>
    </div>
  );
};
export default Platform;
