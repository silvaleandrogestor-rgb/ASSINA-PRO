


import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';

const MobileNav: React.FC = () => {
  const linksToShow = [
    NAV_LINKS.find(l => l.label === 'Dashboard'),
    NAV_LINKS.find(l => l.label === 'Contratos'),
    NAV_LINKS.find(l => l.label === 'Orçamentos'),
    NAV_LINKS.find(l => l.label === 'Assinaturas'),
    NAV_LINKS.find(l => l.label === 'Ver Site'),
  ].filter(Boolean) as (typeof NAV_LINKS[0])[];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {linksToShow.map((link) => {
            if (link.isExternal) {
                return (
                     <a 
                        key={link.href} 
                        href={link.href} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center w-full text-xs font-medium text-gray-500 hover:text-brand-green"
                    >
                        {React.cloneElement(link.icon, { size: 24 })}
                        <span className="mt-1">{link.label}</span>
                    </a>
                )
            }
            return (
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
            )
        })}
      </div>
    </div>
  );
};

export default MobileNav;
