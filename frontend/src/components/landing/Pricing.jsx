const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For solo founders getting started',
    features: ['3 companies', 'Basic lead search', 'Content generation']
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'For serious agencies',
    features: ['Unlimited companies', 'Advanced lead search', 'Outreach automation', 'Analytics & reporting']
  },
  {
    name: 'Agency',
    price: '$99/mo',
    description: 'For teams and large agencies',
    features: ['Everything in Pro', 'White-label', 'Client dashboards', 'API access']
  }
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-400 text-center mt-3 max-w-2xl mx-auto">
          Start free. Upgrade when you need more power.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {plans.map((plan, index) => (
            <div key={index} className={`glass p-6 text-center flex flex-col ${index === 1 ? 'border-gold/50 shadow-gold/20 scale-[1.02]' : ''}`}>
              {index === 1 && (
                <span className="inline-block text-xs font-black tracking-widest uppercase text-[#0B0215] bg-[#FFD700] px-3 py-1 rounded-full mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
              <p className="text-3xl font-black text-gold mt-2">{plan.price}</p>
              <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-left flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-gold">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a href="#pricing" onClick={(e)=>{e.preventDefault(); window.location.href='/dashboard';}} className={`mt-6 block text-center font-black tracking-widest uppercase text-xs py-3 rounded-xl transition ${index===1 ? 'bg-[#FFD700] text-[#0B0215] hover:bg-[#ffdf33]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-white/20 text-xs mt-6">All plans include Outcomes + Client Dashboard (read-only).</p>
      </div>
    </section>
  );
};

export default Pricing;
