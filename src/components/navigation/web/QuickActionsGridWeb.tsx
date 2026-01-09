import React from 'react';
import { ShoppingCart, Shield, Receipt, RotateCcw, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SoonOverlay } from '@/ui';

export const QuickActionsGridWeb = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: ShoppingCart, 
      label: "Buy", 
      action: () => {},
      color: "text-accent hover:text-accent-foreground",
      bg: "hover:bg-accent/10",
      soon: true
    },
    { 
      icon: Shield, 
      label: "Vault Pro", 
      action: () => {},
      color: "text-secondary hover:text-secondary-foreground",
      bg: "hover:bg-secondary/10",
      soon: true
    },
    { 
      icon: Receipt, 
      label: "Transaction", 
      action: () => {},
      color: "text-gold hover:text-gold-foreground",
      bg: "hover:bg-gold/10",
      soon: true
    },
    { 
      icon: RotateCcw, 
      label: "Rollover", 
      action: () => {},
      color: "text-amber hover:text-amber-foreground",
      bg: "hover:bg-amber/10",
      soon: true
    },
    { 
      icon: History, 
      label: "My Bets", 
      action: () => navigate('/my-bets'),
      color: "text-destructive hover:text-destructive-foreground",
      bg: "hover:bg-destructive/10",
      soon: true
    }
  ];

  return (
    <div className="p-3 border border-border bg-card/30 rounded-lg backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-2">
        {actions.map((item, index) => (
          <SoonOverlay key={index} enabled={item.soon}>
            <button
              onClick={item.action}
              className={`flex flex-col items-center justify-center p-2 rounded-md transition-all duration-300 transform hover:scale-105 ${item.bg} group`}
              disabled={item.soon}
            >
              <item.icon className={`h-4 w-4 mb-1 transition-colors duration-300 ${item.color}`} />
              <span className="text-xs text-center font-medium text-foreground group-hover:text-foreground/80 transition-colors duration-300">
                {item.label}
              </span>
            </button>
          </SoonOverlay>
        ))}
      </div>
    </div>
  );
};