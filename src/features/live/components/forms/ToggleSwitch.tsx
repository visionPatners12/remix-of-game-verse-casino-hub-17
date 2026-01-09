
import React from 'react';
import { Switch, Label } from '@/ui';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  trueLabel: string;
  falseLabel: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  trueLabel,
  falseLabel
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Switch
            checked={checked}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-gray-900"
          />
          <span className="text-sm font-medium text-gray-900">
            {checked ? trueLabel : falseLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {checked ? 'Visible par tous' : 'Accessible uniquement par lien'}
        </span>
      </div>
    </div>
  );
};
