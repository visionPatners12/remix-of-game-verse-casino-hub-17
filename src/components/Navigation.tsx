import { NavigationContent } from "./navigation/NavigationContent";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  disableNavigation?: boolean;
}

const Navigation = ({ disableNavigation = false }: NavigationProps) => {
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 10 });
  const isMobile = useIsMobile();
  
  // Cacher seulement sur mobile quand on scroll vers le bas et qu'on n'est pas en haut
  const shouldHide = isMobile && scrollDirection === 'down' && !isAtTop;

  return (
    <header 
      className={`bg-background border-b border-border fixed top-0 left-0 right-0 z-[9998] shadow-sm w-full transition-transform duration-300 ease-in-out ${
        shouldHide ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(3.5rem + env(safe-area-inset-top))'
      }}
    >
      <div className="h-14 flex items-center">
        <NavigationContent disableNavigation={disableNavigation} />
      </div>
    </header>
  );
};

export default Navigation;
