import { Link } from 'react-router-dom';
export const FinalCTA = () => {
  return (
    <section className="px-6 py-12" style={{background:'#FFFCF8'}}>
      <div className="max-w-[1040px] mx-auto rounded-[16px] p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" style={{background:'#FFFFFF', border:'1px solid #EDEDED'}}>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{color:'#0A0A0A'}}>Work that compounds. Proof that closes.</h2>
          <p className="text-sm mt-2 max-w-xl" style={{color:'#6B7280'}}>Free until you feel the compounding. Then Pro. No lock-in.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/access" className="inline-flex items-center justify-center font-bold text-xs tracking-widest uppercase" style={{background:'#5E17EB', color:'#FFFFFF', padding:'12px 20px', height:'44px', borderRadius:'8px', textDecoration:'none'}}>Unlock with token →</Link>
          <a href="#platform" className="inline-flex items-center justify-center font-bold text-xs tracking-widest uppercase" style={{background:'#FFFFFF', border:'1px solid #EDEDED', color:'#0A0A0A', padding:'12px 20px', height:'44px', borderRadius:'8px', textDecoration:'none'}}>See how it works</a>
        </div>
      </div>
    </section>
  );
};
export default FinalCTA;
