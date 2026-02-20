import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({ children, hover, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-6 ${
        hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : 'shadow-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
}
