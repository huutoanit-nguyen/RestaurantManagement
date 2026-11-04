import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false, size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-9';

  if (iconOnly) {
    return (
      <img
        src="/logo-icon.png"
        alt="ResMana Icon"
        className={`w-auto object-contain rounded-xl shadow-xs ${heightClass} ${className}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo-resmana.png"
        alt="ResMana"
        className={`w-auto object-contain ${heightClass}`}
      />
    </div>
  );
};

export default Logo;

