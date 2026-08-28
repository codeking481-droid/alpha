import { Pricing } from '../components/landing/Pricing';

export const PricingPage = () => {
  return (
    <div style={{background:'#FFFCF8', minHeight:'100vh'}}>
      <Pricing />
      <div className="max-w-[1120px] mx-auto px-6 pb-16 text-center">
        <p className="text-sm" style={{color:'#6B7280'}}>Paystack USD • Token issued instantly after success • Questions? <a href="mailto:alphatekxcompany@gmail.com" style={{color:'#5E17EB', fontWeight:600}}>alphatekxcompany@gmail.com</a></p>
      </div>
    </div>
  );
};
export default PricingPage;
