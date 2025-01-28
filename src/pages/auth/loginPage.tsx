import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Lock } from "lucide-react";
import ThemeSwitcher from '@src/components/ThemeSwitcher';

export const LoginPage = () => {
 
  const websiteLoginUrl = "http://localhost:3000/login";

  return (
    <div className="h-[600px] w-full flex flex-col p-4 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="block text-base text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-200">
            <span className="text-zinc-500 dark:text-zinc-400">resume</span>
            <span className="font-bold">tweaker</span>
          </span>
        </div>
        <ThemeSwitcher />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please log in through our website to access the extension features.
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm">
              <p className="text-secondary-foreground">
                For security reasons, authentication must be completed on our main website.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full gap-2" 
              onClick={() => window.open(websiteLoginUrl, '_blank')}
            >
              Go to Login Page
              <ExternalLink className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              After logging in, return to the extension to continue.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}