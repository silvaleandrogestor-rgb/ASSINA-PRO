
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../ui/Logo';
import { NAV_LINKS } from '../../constants';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <Link to="/dashboard">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_LINKS.map((link) => {
            if (link.isExternal) {
                 return (
                    <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-soft-black'
                    >
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                    </a>
                );
            }
            return (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 relative ${
                    isActive
                      ? 'bg-brand-green/10 text-brand-green font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-soft-black'
                  }`
                }
              >
                {({ isActive }) => (
                    <>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-green rounded-r-full"></div>}
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                    </>
                )}
              </NavLink>
            )
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;