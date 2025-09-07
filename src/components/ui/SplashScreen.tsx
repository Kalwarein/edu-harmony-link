import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out animation
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center z-50 transition-opacity duration-500 opacity-0" />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center text-white animate-fade-in">
        <div className="mb-8 animate-bounce">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl border border-white/20">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Sheikh Tais Academy
        </h1>
        
        <p className="text-white/80 text-lg mb-8 animate-pulse">
          Seek Knowledge From Birth To Death 
        </p>
        
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-white/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
