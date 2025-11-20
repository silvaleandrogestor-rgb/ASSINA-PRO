

import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS, EXTRA_LINKS } from '../../constants';
import { Home } from 'lucide-react';

const MobileNav: React.FC = () => {
  const mainLinks = NAV_LINKS.slice(0, 4); 

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {mainLinks.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full text-xs font-medium transition-colors duration-200 ${
                isActive ? 'text-brand-green' : 'text-gray-500 hover:text-brand-green'
              }`
            }
          >
            {React.cloneElement(link.icon, { size: 24 })}
            <span className="mt-1">{link.label}</span>
          </NavLink>
        ))}
        <a href={EXTRA_LINKS[0].href} className="flex flex-col items-center justify-center w-full text-xs font-medium text-gray-500 hover:text-brand-green">
            <Home size={24} />
            <span className="mt-1">{EXTRA_LINKS[0].label}</span>
        </a>
      </div>
    </div>
  );
};

export default MobileNav;