const features = [
  {
    icon: '🚀',
    title: 'Command Hub',
    desc: 'One command center for all companies, revenue and projects.',
    bullets: ['Unlimited companies', 'Real revenue chart', 'Activity feed'],
    accent: 'from-[#FFD700] to-amber-500',
  },
  {
    icon: '✍️',
    title: 'Content Studio',
    desc: 'AI that writes like your best copywriter — not a bot.',
    bullets: ['Groq AI generation', 'Calendar + scheduling', 'Brand voice'],
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: '📧',
    title: 'Outreach Engine',
    desc: 'Find real businesses free, then send outreach that gets replies.',
    bullets: ['Overpass • no API key', 'Resend email', 'Reply inbox'],
    accent: 'from-sky-400 to-blue-500',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'Know what’s working — views, engagement, revenue, growth.',
    bullets: ['Real metrics only', '6-week trends', 'No vanity data'],
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: '💰',
    title: 'Deal Desk',
    desc: 'Invoices, contracts and payments without paperwork chaos.',
    bullets: ['Auto invoices', 'Contract manager', 'Revenue chart'],
    accent: 'from-amber-400 to-orange-500',
  },
  {
    icon: '📈',
    title: 'Outcome Proof',
    desc: 'The only badge that matters: “We made you $X”.',
    bullets: ['Revenue + ROI', 'Charts for clients', 'Shareable proof'],
    accent: 'from-[#FFD700] to-amber-600',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 relative">
      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] tracking-widest uppercase font-black text-white/40">Everything you need • Nothing you don’t</div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4">
            The OS that replaces a <span className="text-gold">6-person team</span>
          </h2>
          <p className="text-white/50 mt-3 leading-relaxed">
            Alpha Agency isn’t a tool. It’s the invisible operator that finds leads, writes content, sends emails and proves you made money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-12">
          {features.map((f, i) => (
            <div key={i} className="group relative glass rounded-[20px] p-6 hover:bg-white/[0.06] hover:border-gold/20 transition duration-300 hover:-translate-y-1 hover:shadow-gold/10">
              <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.06] transition`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-lg shadow-gold`}>{f.icon}</div>
                <h3 className="text-lg font-black tracking-tight text-white mt-4">{f.title}</h3>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{f.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {f.bullets.map(b=>(
                    <li key={b} className="flex items-center gap-2 text-xs text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-[11px] font-black tracking-widest uppercase text-white/20 group-hover:text-[#FFD700] transition">Learn more →</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-black tracking-widest uppercase text-white/60">Built for agencies doing $3k–$50k/mo</div>
            <div className="text-xs text-white/30 mt-1">If you sell services, this replaces your lead list, Gmail hacks and “what did you do last week?” slides.</div>
          </div>
          <a href="#pricing" className="px-6 py-3 rounded-xl bg-white text-[#0B0215] font-black text-xs tracking-widest uppercase hover:bg-white/90 whitespace-nowrap">See pricing ↓</a>
        </div>
      </div>
    </section>
  );
};

export default Features;
