import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { MessageCircle, Target, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface IntroSliderProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slideConfig = [
  {
    key: 'feed',
    icon: MessageCircle,
    gradient: "from-violet-500/20 via-transparent to-transparent",
    iconColor: "text-violet-400",
    rippleColor: "bg-violet-400/10",
  },
  {
    key: 'predict',
    icon: Target,
    gradient: "from-amber-500/20 via-transparent to-transparent",
    iconColor: "text-amber-400",
    rippleColor: "bg-amber-400/10",
  },
  {
    key: 'wallet',
    icon: Wallet,
    gradient: "from-emerald-500/20 via-transparent to-transparent",
    iconColor: "text-emerald-400",
    rippleColor: "bg-emerald-400/10",
  },
];

export function IntroSlider({ onComplete, onSkip }: IntroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const { t } = useTranslation('auth');

  const handleNext = () => {
    if (activeIndex === slideConfig.length - 1) {
      onComplete();
    } else {
      swiperRef.current?.slideNext();
    }
  };

  const progress = ((activeIndex + 1) / slideConfig.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden safe-area-top">
      {/* Floating particles background */}
      <FloatingParticles count={25} />
      
      {/* Slide-specific gradient overlay */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 bg-gradient-radial ${slideConfig[activeIndex].gradient} pointer-events-none`}
      />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-safe">
        <ProgressBar progress={progress} />
      </div>

      {/* Skip button */}
      <div className="absolute top-8 right-6 z-20 mt-safe">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('onboarding.skip')}
        </Button>
      </div>

      {/* Swiper content */}
      <Swiper
        modules={[Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="flex-1 w-full"
        allowTouchMove={true}
      >
        {slideConfig.map((slide, index) => (
          <SwiperSlide key={index}>
            <SlideContent 
              slide={slide} 
              isActive={index === activeIndex}
              t={t}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom navigation */}
      <div className="px-6 pb-8 pb-safe space-y-6 relative z-10">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {slideConfig.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => swiperRef.current?.slideTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30'
              }`}
              animate={{
                width: index === activeIndex ? 24 : 8,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 group overflow-hidden relative"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              {activeIndex === slideConfig.length - 1 ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  {t('onboarding.getStarted')}
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

interface SlideContentProps {
  slide: typeof slideConfig[0];
  isActive: boolean;
  t: (key: string) => string;
}

function SlideContent({ slide, isActive, t }: SlideContentProps) {
  const Icon = slide.icon;
  const title = t(`onboarding.slides.${slide.key}.title`);
  const titleHighlight = t(`onboarding.slides.${slide.key}.titleHighlight`);
  const description = t(`onboarding.slides.${slide.key}.description`);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pt-16">
      {/* Icon with ripple effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mb-12"
      >
        {/* Ripple circles */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`absolute inset-0 rounded-full ${slide.rippleColor}`}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={isActive ? {
              scale: [1, 1.5 + i * 0.3],
              opacity: [0.3, 0],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
            style={{
              width: 160,
              height: 160,
              marginLeft: -80,
              marginTop: -80,
              left: '50%',
              top: '50%',
            }}
          />
        ))}
        
        {/* Icon container */}
        <motion.div
          animate={isActive ? {
            y: [0, -10, 0],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-2xl`}>
            <Icon className={`w-20 h-20 ${slide.iconColor}`} strokeWidth={1.5} />
          </div>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4 tracking-tight"
      >
        {title}{' '}
        <AnimatedGradientText>{titleHighlight}</AnimatedGradientText>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
}
