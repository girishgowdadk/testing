const Footer = () => {
  return (
     <footer className="py-6 text-center border-t border-slate-50 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-display text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Intelligent Mismatch Analyser v1.0
        </p>
        <div className="flex gap-8">
          {['Privacy', 'Terms', 'Security', 'Support'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;