const qas = [
  { q:'Do I need an API key for lead finder?', a:'No. It uses OpenStreetMap (Nominatim + Overpass) — free, unlimited. No key, no card.' },
  { q:'Does outreach really send emails?', a:'Yes. Resend (or SendGrid) via /api/outreach/send. Saved to messages, tracked, reply-aware.' },
  { q:'Can clients see their ROI?', a:'Yes. /outcomes proves ROI + /client is read-only per client. Isolated, shareable.' },
  { q:'What if Supabase isn’t configured?', a:'Everything works in-memory (empty until you add). No fake data, no mocks. Configure later and it persists to D1/Supabase.' },
];

export const FAQ = () => {
  return (
    <section className="py-14 px-4 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-black tracking-tight text-white text-center">FAQ — zero fluff</h2>
        <div className="mt-8 grid gap-3">
          {qas.map(x=>(
            <div key={x.q} className="glass rounded-2xl p-5">
              <div className="font-black text-white text-sm">{x.q}</div>
              <div className="text-white/50 text-sm mt-2 leading-relaxed">{x.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FAQ;
