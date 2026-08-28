export const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Alpha Agency. Built with 🧠 by the AlphaTekx team. • alphatekx.name.ng</p>
        <div className="flex justify-center gap-6 mt-3">
          <a href="#" className="hover:text-gold transition">Privacy</a>
          <a href="#" className="hover:text-gold transition">Terms</a>
          <a href="mailto:hello@alphatekx.name.ng" className="hover:text-gold transition">Contact</a>
          <a href="/dashboard" className="hover:text-gold transition">Dashboard →</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
