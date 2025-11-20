
import React, { useState, useEffect } from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSignUpClick: () => void;
  forceScrolled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick, forceScrolled = false }) => {
  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (forceScrolled) return;
    const handleScroll = () => {
      // Don't change header background if mobile menu is open
      if (!isMenuOpen) {
        setIsScrolled(window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen, forceScrolled]);
  
  // When menu opens, force scrolled styles for better visibility
  useEffect(() => {
      if (forceScrolled) return;
      if (isMenuOpen) {
          setIsScrolled(true);
      } else {
          // Re-evaluate scroll position when menu closes
          setIsScrolled(window.scrollY > 10);
      }
  }, [isMenuOpen, forceScrolled]);


  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    // If we're on a different page, navigate to the homepage first,
    // passing the scroll target in the state.
    if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: targetId } });
    } else {
        // If we're already on the homepage, just scroll smoothly.
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleLoginRedirect = () => {
      navigate('/login');
      setIsMenuOpen(false);
  }

  const headerBgClass = isScrolled ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm' : 'bg-transparent';
  const textColorClass = isScrolled ? 'text-soft-black' : 'text-white';
  const iconColor = isScrolled ? '#212121' : '#FFFFFF';

  return (
    <header className={`fixed top-0 z-40 w-full transition-all duration-300 ${headerBgClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/">
            <Logo textColor={textColorClass} iconColor={iconColor} />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="flex items-center">
              <a href="#planos" onClick={(e) => handleNavClick(e, 'planos')} className={`font-medium transition-colors duration-300 px-4 py-2 rounded-full text-sm ${isScrolled ? 'text-gray-600 hover:text-soft-black' : 'text-white hover:bg-white/20'}`}>Planos</a>
              <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className={`font-medium transition-colors duration-300 px-4 py-2 rounded-full text-sm ${isScrolled ? 'text-gray-600 hover:text-soft-black' : 'text-white hover:bg-white/20'}`}>FAQ</a>
              <a href="#contato" onClick={(e) => handleNavClick(e, 'contato')} className={`font-medium transition-colors duration-300 px-4 py-2 rounded-full text-sm ${isScrolled ? 'text-gray-600 hover:text-soft-black' : 'text-white hover:bg-white/20'}`}>Contato</a>
            </nav>
            <Button variant="ghost" onClick={handleLoginRedirect} className={`transition-colors duration-300 ${textColorClass} ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'}`}>Login</Button>
            <Button variant="primary" onClick={onSignUpClick}>Criar Conta</Button>
          </div>
          
          {/* Mobile UI */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="primary" size="sm" onClick={handleLoginRedirect}>Conecte-se</Button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-md ${textColorClass}`}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#planos" onClick={(e) => handleNavClick(e, 'planos')} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Planos</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">FAQ</a>
            <a href="#contato" onClick={(e) => handleNavClick(e, 'contato')} className="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Contato</a>
            <button onClick={handleLoginRedirect} className="text-gray-700 hover:bg-gray-100 block w-full text-left px-3 py-2 rounded-md text-base font-medium">Login</button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;