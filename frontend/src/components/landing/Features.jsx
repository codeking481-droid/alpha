const features = [
  {
    icon: '🚀',
    title: 'Command Hub',
    description: 'See all your companies, projects, and revenue in one place.'
  },
  {
    icon: '✍️',
    title: 'Content Studio',
    description: 'Generate posts, articles, and scripts with AI.'
  },
  {
    icon: '📧',
    title: 'Outreach Engine',
    description: 'Find leads, send personalized emails, and track replies.'
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Track views, engagement, and revenue.'
  },
  {
    icon: '💰',
    title: 'Deal Desk',
    description: 'Invoice clients, track payments, and manage contracts.'
  },
  {
    icon: '📈',
    title: 'Outcome Tracking',
    description: 'Prove ROI with real revenue and performance data.'
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-16 px-4 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center tracking-tight">
          Everything You Need to Run Your Agency
        </h2>
        <p className="text-gray-400 text-center mt-3 max-w-2xl mx-auto">
          Alpha Agency is the invisible OS that does the work of a full team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {features.map((feature, index) => (
            <div key={index} className="glass p-6 text-center hover:border-gold/30 transition group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition">{feature.icon}</div>
              <h3 className="text-lg font-black text-white tracking-tight">{feature.title}</h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
