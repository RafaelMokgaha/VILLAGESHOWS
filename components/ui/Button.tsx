import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_20px_rgba(255,122,0,0.4)] hover:shadow-[0_0_30px_rgba(255,122,0,0.6)] border border-primary",
    secondary: "bg-transparent border border-white/20 text-white hover:bg-white/10",
    glass: "glass-panel text-white hover:bg-white/10 border-white/20 hover:border-primary/50",
    ghost: "bg-transparent text-gray-300 hover:text-primary"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};