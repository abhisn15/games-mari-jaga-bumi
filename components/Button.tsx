'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { playSoundEffect } from '@/lib/soundEffects';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: ButtonProps) {
  // Padding lebih besar di mobile untuk mudah di-klik
  const baseClasses =
    'inline-flex items-center justify-center rounded-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 text-base sm:text-lg md:text-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-3 sm:border-4 border-white min-h-[44px] sm:min-h-[48px]';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl active:from-green-700 active:to-green-800',
    secondary: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg active:from-blue-600 active:to-blue-700',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl active:from-red-700 active:to-red-800',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  const buttonStyle = { fontFamily: 'var(--font-baloo)' };

  const handleClick = () => {
    if (!disabled) {
      playSoundEffect('click');
      onClick?.();
    }
  };

  const buttonContent = (
    <motion.div
      whileHover={{ scale: 1.08, y: -3, rotate: 1 }}
      whileTap={{ scale: 0.92, rotate: -1 }}
      animate={{
        boxShadow: variant === 'primary' ? [
          '0 4px 15px rgba(34, 197, 94, 0.4)',
          '0 6px 20px rgba(34, 197, 94, 0.6)',
          '0 4px 15px rgba(34, 197, 94, 0.4)',
        ] : [],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="w-full h-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} style={buttonStyle} onClick={handleClick}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={classes} disabled={disabled} style={buttonStyle}>
      {buttonContent}
    </button>
  );
}
