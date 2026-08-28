export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col justify-center items-center py-8 gap-3">
    <div className="w-8 h-8 border-4 border-white/10 border-t-[#E6C87A] rounded-full animate-spin" />
    {label && <span className="text-xs tracking-widest uppercase font-bold text-white/30">{label}</span>}
  </div>
);

export default Spinner;
