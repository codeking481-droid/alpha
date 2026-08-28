export const HowItWorks = () => {
  const steps = [
    { n:'01', t:'Find', d:'Search any city + niche. 50 real businesses in 30s. No API key. Save to localStorage.', icon:'🔍' },
    { n:'02', t:'Contact', d:'AI drafts personal email. One click sends via Resend. Tracked as sent.', icon:'✉️' },
    { n:'03', t:'Prove', d:'Replies → inbox. Revenue → Outcomes. Client sees live proof in read-only dashboard.', icon:'📈' },
  ];
  return (
    <section className="py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white text-center">How it works — 3 steps, 10 minutes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {steps.map(s=>(
            <div key={s.n} className="relative glass rounded-2xl p-6">
              <div className="absolute -top-3 left-6 px-2 py-1 rounded-full bg-[#FFD700] text-[#0B0215] text-[11px] font-black tracking-widest">STEP {s.n}</div>
              <div className="text-3xl mt-2">{s.icon}</div>
              <h3 className="text-lg font-black text-white mt-3">{s.t}</h3>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
