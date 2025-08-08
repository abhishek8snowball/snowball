import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import AnimatedInput from './AnimatedInput';
import { Search } from 'lucide-react';

const AnimatedInputDemo = () => {
  const [domain, setDomain] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Domain submitted:", domain);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-foreground mb-2">
            Animated Input Demo
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Showcasing the animated glowing border input
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="domain" className="block text-sm font-semibold text-foreground">
                Domain or Website URL
              </label>
              <AnimatedInput
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                Watch the animated border glow effect
              </p>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={!domain.trim()}
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Submit
              </Button>
            </div>
          </form>
          
          <div className="text-center space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm text-muted-foreground">
              Features:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Animated gradient border (#7765e3 → #9f8bff → #7765e3)</li>
              <li>• Smooth 3-second animation cycle</li>
              <li>• Focus glow effect with soft shadow</li>
              <li>• Modern rounded-xl border radius</li>
              <li>• Transparent background for card integration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedInputDemo;
