import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, PlusSquare, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AndroidInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: MoreVertical,
    title: 'Ouvrir le menu',
    description: 'Appuyez sur les 3 points en haut à droite de Chrome',
  },
  {
    icon: PlusSquare,
    title: 'Ajouter à l\'écran d\'accueil',
    description: 'Sélectionnez "Ajouter à l\'écran d\'accueil" ou "Installer l\'application"',
  },
  {
    icon: Check,
    title: 'Confirmer',
    description: 'Appuyez sur "Ajouter" pour installer PRYZEN',
  },
];

export function AndroidInstallGuide({ isOpen, onClose }: AndroidInstallGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Installer PRYZEN sur Android
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Current step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                {(() => {
                  const StepIcon = steps[currentStep].icon;
                  return <StepIcon className="w-8 h-8 text-primary" />;
                })()}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            Plus tard
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {currentStep < steps.length - 1 ? 'Suivant' : 'Compris'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
