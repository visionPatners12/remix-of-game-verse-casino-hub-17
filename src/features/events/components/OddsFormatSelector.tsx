import React from 'react';
import { OddsFormat } from '@/types/oddsFormat';

interface OddsFormatSelectorProps {
  format: OddsFormat;
  onChange: (format: OddsFormat) => void;
}

const formatLabels: Record<OddsFormat, string> = {
  decimal: 'Décimal',
  american: 'Américain',
  fractional: 'Fractionnaire'
};

export const OddsFormatSelector: React.FC<OddsFormatSelectorProps> = ({ format, onChange }) => {
  return (
    <div className="flex md:justify-end">
      <div className="inline-flex border rounded-lg p-1">
        {Object.entries(formatLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as OddsFormat)}
            className={`h-9 px-3 text-xs md:text-sm rounded-lg transition duration-150 ${
              format === key 
                ? 'border-[2px] border-foreground' 
                : 'border border-transparent hover:translate-y-[1px]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};