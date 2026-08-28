import { Link } from 'react-router-dom';
import Auth from './Auth.jsx';

export const Signup = () => {
  return (
    <div style={{background:'#FFFCF8', minHeight:'100vh'}}>
      <div className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="label" style={{color:'#6B7280'}}>SIGNUP • TOKEN FLOW</div>
        <h1 className="font-semibold mt-2" style={{color:'#0A0A0A', fontSize:'32px'}}>Get access. Pay only when you deliver.</h1>
        <p className="mt-3" style={{color:'#6B7280', fontSize:'15px'}}>1. Sign up → 2. See <Link to="/access" style={{color:'#5E17EB', fontWeight:600}}>Access</Link> → 3. Enter token or <Link to="/pricing" style={{color:'#5E17EB', fontWeight:600}}>Buy $50/$99 USD</Link> via Paystack → 4. Unlock platform.</p>
      </div>
      <Auth />
    </div>
  );
};
export default Signup;
