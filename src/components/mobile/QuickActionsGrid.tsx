import React from 'react';
import { Shield, Receipt, ArrowLeftRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActionsGrid = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Shield, 
      label: "Vault Pro", 
      action: () => {},
      soon: true
    },
    { 
      icon: Receipt, 
      label: "Transaction", 
      action: () => navigate('/transactions'),
      soon: false
    },
    { 
      icon: ArrowLeftRight, 
      label: "Swap", 
      action: () => navigate('/swap'),
      soon: false
    },
    { 
      icon: Users, 
      label: "Referral", 
      action: () => navigate('/user-dashboard'),
      soon: false
    }
  ];

  return (
    <div className="px-4 py-3 bg-background">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="flex flex-col items-center justify-center py-2 active:opacity-50"
            disabled={item.soon}
          >
            <item.icon className="h-6 w-6 mb-1.5 text-foreground" />
            <span className="text-xs text-center text-muted-foreground">
              {item.label}
            </span>
            {item.soon && (
              <span className="text-[10px] text-muted-foreground/50 mt-0.5">Soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
