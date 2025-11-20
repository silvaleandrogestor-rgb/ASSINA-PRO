
import React from 'react';

const Logo: React.FC<{ className?: string, textColor?: string, iconColor?: string }> = ({ className = 'h-10', textColor = 'text-soft-black', iconColor = '#212121' }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <svg viewBox="0 0 40 40" className="h-full w-auto">
            <path d="M20 38C10.059 38 2 29.941 2 20S10.059 2 20 2s18 8.059 18 18" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" transform="rotate(-45 20 20)"/>
            <path d="M12 20l6 6 10-12" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M20 24 C 22 23, 24 22, 28 23" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span className={`font-poppins text-2xl font-bold ${textColor}`}>
            ASSINA <span className="text-brand-green">PRO</span>
        </span>
    </div>
);

export default Logo;