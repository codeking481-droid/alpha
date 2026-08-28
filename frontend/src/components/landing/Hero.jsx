import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="text-center py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs tracking-widest uppercase font-bold text-white/40">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Alpha Agency • Live on alphatekx.name.ng
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-white mt-6 tracking-tight leading-none">
          The Invisible OS for{' '}
          <span className="text-gold">Modern Agencies</span>
        </h1>
        <p className="text-xl text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed">
          Run multiple companies, create content, find leads, close deals, and prove ROI — all from one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
            🚀 Get Started Free
          </Link>
          <a href="#features" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
            Learn More →
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          No credit card required • Free forever for early adopters
        </p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            ['Command Hub', 'All companies'],
            ['Content Studio', 'AI generation'],
            ['Outreach Engine', 'Real leads'],
            ['Deal Desk', 'Invoices'],
          ].map(([k,v]) => (
            <div key={k} className="glass py-3 px-2 text-center">
              <div className="font-black text-white tracking-widest uppercase">{k}</div>
              <div className="text-white/30">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
