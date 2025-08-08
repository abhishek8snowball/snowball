import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const [currentChildren, setCurrentChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (location !== displayLocation && !isAnimating) {
      setIsAnimating(true);
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation, isAnimating]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      // Update content and location after fadeOut completes
      setDisplayLocation(location);
      setCurrentChildren(children);
      setTransitionStage('fadeIn');
    } else if (transitionStage === 'fadeIn') {
      // Animation cycle complete
      setIsAnimating(false);
    }
  };

  return (
    <div 
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={onAnimationEnd}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        transform: 'translateZ(0)',
        margin: 0,
        padding: 0,
        zIndex: 1
      }}
    >
      {currentChildren}
    </div>
  );
};

export default PageTransition; 