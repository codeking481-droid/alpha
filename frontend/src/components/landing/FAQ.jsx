const qas = [
  { q:'Do I need an API key to find leads?', a:'No. Nominatim + Overpass on OpenStreetMap. Free, unlimited, no key, no card. Port Harcourt, Lagos, any city.' },
  { q:'Is outreach real email?', a:'Yes. Resend (with SendGrid fallback) via /api/outreach/send. Messages are saved to messages/replies and reflected in analytics.' },
  { q:'How does proof work for clients?', a:'Outcomes computes revenue, cost and ROI. Client dashboard (/client) is read-only and isolated per clientId — share the link, not a PDF.' },
  { q:'What if Supabase is not configured?', a:'The OS runs in-memory, empty until you add. No mocks. Add SUPABASE_URL + keys and it persists to D1/Supabase instantly.' },
];

export const FAQ = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-[1160px] mx-auto">
        <div className="eyebrow text-white/30">FAQ • No theatre</div>
        <h2 className="text-xl font-black tracking-tight text-white mt-2">Quiet answers.</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {qas.map(x=>(
            <div key={x.q} className="mature-card rounded-[16px] p-5">
              <div className="text-sm font-bold text-white">{x.q}</div>
              <div className="text-sm leading-6 text-white/40 mt-2">{x.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
