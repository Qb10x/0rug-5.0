import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* New Logo Image */}
      <div className={`${sizeClasses[size]} relative`}>
        <Image 
          src="/0rug-logo.png" 
          alt="0RUG Logo"
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-contain"
          priority={true}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg">ØRUG</span>
                                <span className="text-gray-400 text-xs">Token Analysis Powered by AI</span>
        </div>
      )}
    </div>
  );
};

export default Logo; 