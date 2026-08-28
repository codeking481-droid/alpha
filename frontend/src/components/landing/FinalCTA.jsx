import { Link } from 'react-router-dom';
export const FinalCTA = () => {
  return (
    <section className="px-4 py-14">
      <div className="max-w-4xl mx-auto glass rounded-[24px] p-8 sm:p-10 text-center border-gold/20 shadow-gold">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Stop juggling tabs. Start printing proof.</h2>
        <p className="text-white/50 mt-3 max-w-2xl mx-auto">Open Command Hub, find 20 leads free, send 3 emails, watch outcomes. 10 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link to="/dashboard" className="btn-primary px-8 py-4">🚀 Open Command Hub free</Link>
          <a href="#pricing" className="btn-secondary px-8 py-4">See pricing</a>
        </div>
        <p className="text-white/20 text-xs mt-3">alphabetekx.name.ng • $5k/mo agencies • 🇳🇬 Lagos • London • Accra</p>
      </div>
    </section>
  );
};
export default FinalCTA;
