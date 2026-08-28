import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Pricing } from '../components/landing/Pricing';
import { Footer } from '../components/landing/Footer';

export const Landing = () => {
  return (
    <div style={{background:'#FFFCF8', minHeight:'100vh'}}>
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Landing;
