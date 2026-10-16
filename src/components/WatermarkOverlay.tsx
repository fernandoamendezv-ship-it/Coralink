import React from 'react';
import { CORALINK_FALLBACK_LOGO_URL, CORALINK_LOGO_URL } from '../utils/logoConstants';

interface WatermarkOverlayProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  size = 'sm',
  position = 'bottom-right',
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'top-right': 'top-2 right-2',
  }[position];

  const sizeClasses = {
    xs: {
      box: 'px-1.5 py-0.5 gap-1 rounded-md text-[8px]',
      img: 'w-3 h-3',
    },
    sm: {
      box: 'px-2 py-0.5 gap-1.5 rounded-lg text-[9px]',
      img: 'w-3.5 h-3.5',
    },
    md: {
      box: 'px-2.5 py-1 gap-1.5 rounded-xl text-[10px]',
      img: 'w-4 h-4',
    },
    lg: {
      box: 'px-3 py-1.5 gap-2 rounded-xl text-xs',
      img: 'w-5 h-5',
    },
  }[size];

  return (
    <div
      aria-hidden="true"
      className={`absolute ${positionClasses} z-10 pointer-events-none select-none flex items-center bg-[#0B2545]/75 dark:bg-[#0B2545]/85 backdrop-blur-xs border border-white/25 shadow-sm text-white font-black tracking-wider uppercase transition-opacity duration-300 ${sizeClasses.box} ${className}`}
    >
      <img
        src={CORALINK_FALLBACK_LOGO_URL}
        alt="Coralink"
        className={`${sizeClasses.img} object-contain shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = CORALINK_LOGO_URL;
        }}
      />
      <span className="leading-none drop-shadow-xs">Coralink</span>
    </div>
  );
};
