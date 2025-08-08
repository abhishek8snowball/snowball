import React from "react";
import { Input } from './ui/input';

const AnimatedInput = ({ 
  value, 
  onChange, 
  placeholder = "example.com", 
  disabled = false, 
  className = "",
  ...props 
}) => {
  return (
    <div className="relative group">
      {/* Animated border container */}
      <div 
        className="absolute inset-0 rounded-xl p-[2px] animate-border-glow"
        style={{
          background: 'linear-gradient(90deg, #7765e3 0%, #9f8bff 50%, #7765e3 100%)',
          backgroundSize: '200% 100%',
        }}
      >
        <div className="h-full w-full rounded-xl bg-background"></div>
      </div>
      
      {/* Input field */}
      <div className="relative">
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            relative z-10
            border-0 
            rounded-xl 
            bg-transparent 
            focus:ring-2 
            focus:ring-[#7765e3]/20 
            focus:ring-offset-0
            focus:shadow-[0_0_20px_rgba(119,101,227,0.3)]
            transition-all 
            duration-300
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default AnimatedInput;
