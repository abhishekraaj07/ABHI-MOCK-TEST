import React from 'react';

interface WordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Wordmark: React.FC<WordmarkProps> = ({ className = '', size = 'md' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`inline-flex flex-col leading-none select-none text-left ${className}`}>
      <span
        className={`font-bold tracking-tight text-[var(--ink)] ${
          isSm ? 'text-base' : isLg ? 'text-2xl' : 'text-lg'
        }`}
      >
        ABHI
      </span>
      <span
        className={`font-medium tracking-wider text-[var(--accent)] ${
          isSm ? 'text-[9px]' : isLg ? 'text-xs' : 'text-[10px]'
        }`}
      >
        MOCK TEST
      </span>
    </div>
  );
};
