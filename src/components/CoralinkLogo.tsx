import React from 'react';

interface CoralinkLogoProps {
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'fill';
  showSubtitle?: boolean;
  className?: string;
}

export const CoralinkLogo: React.FC<CoralinkLogoProps> = ({
  src,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-9 h-9',
    sm: 'w-11 h-11',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    hero: 'w-48 h-48 sm:w-56 sm:h-56',
    fill: 'w-full h-full',
  };

  const dimClass = sizeMap[size];
  const logoSource = src || '/LG1.png';

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSource}
        alt="Coralink"
        className={`${dimClass} object-contain transition-transform duration-300 hover:scale-[1.02]`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/LG1.png';
        }}
        loading="eager"
      />
    </div>
  );
};
