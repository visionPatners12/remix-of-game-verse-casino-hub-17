import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareIcon, AddToHomeScreenIcon } from "./icons/IOSInstallIcons";
import { useTranslation } from "react-i18next";

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallGuide({ isOpen, onClose }: IOSInstallGuideProps) {
  const [step, setStep] = useState(1);
  const { t } = useTranslation();

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onClose();
      setStep(1);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('pwa.installTitle', 'Install Pryzen')}
              </h2>
              <p className="text-zinc-400 text-sm">
                {t('pwa.iosInstructions', 'On iPhone, apps are added from Safari.')}
              </p>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  {/* Icon container */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700"
                    >
                      <ShareIcon size={64} className="text-white" />
                    </motion.div>
                  </div>

                  {/* Instructions */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {t('pwa.step1Title', 'Tap the Share button')}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {t('pwa.step1Subtitle', 'at the bottom of Safari')}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  {/* Icons container */}
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                      <ShareIcon size={32} className="text-zinc-500" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-zinc-500"
                    >
                      →
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
                    >
                      <AddToHomeScreenIcon size={40} className="text-white" />
                    </motion.div>
                  </div>

                  {/* Instructions */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {t('pwa.step2Title', 'Scroll and tap Add to Home Screen')}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {t('pwa.step2Subtitle', 'then tap Add')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action button */}
            <div className="mt-8">
              <Button
                onClick={handleNext}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
              >
                {step === 1 
                  ? t('pwa.showMe', 'Show me')
                  : t('pwa.gotIt', 'Got it')
                }
              </Button>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-6">
              <div 
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === 1 ? 'bg-primary' : 'bg-zinc-700'
                }`}
              />
              <div 
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === 2 ? 'bg-primary' : 'bg-zinc-700'
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
