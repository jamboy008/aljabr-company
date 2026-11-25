'use client';

import React from 'react';

export interface PlatformButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm';

  const variantClass =
    variant === 'primary'
      ? 'border border-gold-500/40 bg-navy-900 font-semibold text-white hover:bg-navy-800 dark:border-gold-400/50 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400'
      : variant === 'danger'
        ? 'bg-red-600 font-semibold text-white hover:bg-red-700'
        : variant === 'ghost'
          ? 'text-slate-600 hover:bg-slate-100 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-navy-900 dark:hover:text-gold-300'
          : 'border border-slate-200 bg-white font-medium text-navy-900 hover:border-gold-500/40 hover:bg-slate-50 dark:border-navy-800 dark:bg-navy-900 dark:text-slate-100 dark:hover:bg-navy-800';

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

export interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white dark:border-navy-800 dark:bg-navy-950 ${className}`}
  >
    {children}
  </div>
);

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
}) => (
  <div className="space-y-1">
    <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
      {title}
    </h1>
    {subtitle && (
      <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
    )}
  </div>
);
