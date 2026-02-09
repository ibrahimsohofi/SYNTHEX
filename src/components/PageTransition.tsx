import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit' | 'idle'>('idle');

  useEffect(() => {
    // On route change, trigger exit animation
    setTransitionStage('exit');
    setIsTransitioning(true);

    const exitTimeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('enter');
    }, 200);

    const enterTimeout = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionStage('idle');
    }, 500);

    return () => {
      clearTimeout(exitTimeout);
      clearTimeout(enterTimeout);
    };
  }, [location.pathname]);

  // Update children without animation if only children prop changes
  useEffect(() => {
    if (transitionStage === 'idle') {
      setDisplayChildren(children);
    }
  }, [children, transitionStage]);

  const getTransitionClasses = () => {
    if (transitionStage === 'exit') {
      return 'opacity-0 translate-y-4 scale-[0.99]';
    }
    if (transitionStage === 'enter' && isTransitioning) {
      return 'opacity-100 translate-y-0 scale-100';
    }
    return 'opacity-100 translate-y-0 scale-100';
  };

  return (
    <div
      className={`transition-all duration-300 ease-out transform ${getTransitionClasses()}`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
