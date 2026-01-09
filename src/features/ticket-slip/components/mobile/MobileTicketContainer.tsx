import React from 'react';

interface MobileTicketContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileTicketContainer({ children, className = '' }: MobileTicketContainerProps) {
  return (
    <div className={`
      bg-background 
      rounded-lg 
      border border-border/10 
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
}