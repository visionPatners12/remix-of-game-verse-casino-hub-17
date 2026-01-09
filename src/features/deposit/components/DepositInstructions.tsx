import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Clock, CheckCircle, Copy, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface DepositInstructionsProps {
  cryptoName: string;
  cryptoSymbol: string;
}

export const DepositInstructions = ({ cryptoName, cryptoSymbol }: DepositInstructionsProps) => {
  const { t } = useTranslation('deposit');

  const instructions = [
    {
      icon: Copy,
      titleKey: 'instructions.step1Title',
      descKey: 'instructions.step1Desc'
    },
    {
      icon: Smartphone,
      titleKey: 'instructions.step2Title',
      descKey: 'instructions.step2Desc'
    },
    {
      icon: Clock,
      titleKey: 'instructions.step3Title',
      descKey: 'instructions.step3Desc'
    },
    {
      icon: Shield,
      titleKey: 'instructions.step4Title',
      descKey: 'instructions.step4Desc'
    }
  ];

  const reminders = [
    { key: 'reminders.onlySend', params: { name: cryptoName, symbol: cryptoSymbol } },
    { key: 'reminders.verifyAddress', params: {} },
    { key: 'reminders.minimum', params: { symbol: cryptoSymbol } },
    { key: 'reminders.confirmation', params: {} }
  ];

  return (
    <div className="space-y-4">
      {/* Instructions Card */}
      <Card className="relative overflow-hidden border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50/80 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-400/20 rounded-full blur-2xl" />
        
        <CardContent className="relative p-5">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            {t('instructions.title')}
          </h3>
          <div className="space-y-3">
            {instructions.map((instruction, index) => {
              const IconComponent = instruction.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t(instruction.titleKey)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(instruction.descKey, { name: cryptoName, symbol: cryptoSymbol })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reminders Card */}
      <Card className="relative overflow-hidden border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10">
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl" />
        
        <CardContent className="relative p-5">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            {t('reminders.title')}
          </h3>
          <div className="space-y-2.5">
            {reminders.map((reminder, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(reminder.key, reminder.params)}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
