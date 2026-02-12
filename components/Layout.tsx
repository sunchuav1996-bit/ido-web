import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-brand-dark font-semibold" : "text-brand-lightText hover:text-brand-blue";

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-text bg-brand-bg selection:bg-brand-blue selection:text-white">
      {/* Navbar */}
      <nav className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 flex justify-between items-center bg-transparent z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="ido logo" className="w-14 h-14 object-contain group-hover:opacity-80 transition-opacity" />
          <div className="flex flex-col items-start">
            <span className="text-4xl font-bold text-brand-dark tracking-tight leading-none">ido</span>
            <span className="text-[11px] text-brand-lightText font-medium group-hover:text-brand-blue transition-colors tracking-wide">i do for you</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className={`text-base transition-colors ${isActive('/')}`}>Home</Link>
          <Link to="/order" className={`text-base transition-colors ${isActive('/order')}`}>Order</Link>
          <Link to="/contact" className={`text-base transition-colors ${isActive('/contact')}`}>Contact</Link>
        </div >

        {/* Mobile Menu Toggle */}
        < button
          className="md:hidden text-brand-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button >
      </nav >

      {/* Mobile Nav */}
      {
        isMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white shadow-lg z-40 p-6 flex flex-col gap-4 border-t">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2">Home</Link>
            <Link to="/order" onClick={() => setIsMenuOpen(false)} className="block py-2">Order</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-2">Contact</Link>
          </div>
        )
      }

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 lg:px-12 relative">
        {children}
      </main>
    </div >
  );
};