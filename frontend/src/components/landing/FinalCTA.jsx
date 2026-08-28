import { Link } from 'react-router-dom';
export const FinalCTA = () => {
  return (
    <section className="px-4 py-12">
      <div className="max-w-[1160px] mx-auto rounded-[20px] hairline bg-white p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0215]">Work that compounds. Proof that closes.</h2>
          <p className="text-sm text-[#0B0215]/50 mt-2 max-w-xl">Free until you feel the compounding. Then Pro. No lock-in.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/dashboard" className="bg-[#0B0215] text-white px-7 py-3.5 rounded-full font-black text-xs tracking-widest uppercase hover:bg-black">Open Command Hub →</Link>
          <a href="#features" className="hairline px-7 py-3.5 rounded-full font-black text-xs tracking-widest uppercase text-[#0B0215]/60 hover:bg-black/[0.04]">See how it works</a>
        </div>
      </div>
    </section>
  );
};
export default FinalCTA;
