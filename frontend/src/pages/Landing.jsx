import { Hero } from '../components/landing/Hero';
import { StatsStrip } from '../components/landing/StatsStrip';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { FAQ } from '../components/landing/FAQ';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0B0215]">
      <Hero />
      <StatsStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Landing;
