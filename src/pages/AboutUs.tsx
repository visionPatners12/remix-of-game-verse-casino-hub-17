import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Users, Mail, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';

export default function AboutUs() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: "Security",
      description: "Advanced protection of your data"
    },
    {
      icon: Zap,
      title: "Innovation", 
      description: "Cutting-edge technology"
    },
    {
      icon: Users,
      title: "Community",
      description: "Collaborative experience"
    }
  ];

  return (
    <Layout hideNavigation>
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="About Us" />

        {/* Hero Simplified */}
        <div className="px-3 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Next Generation Sports Betting
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Advanced technology and passion for sports for a unique experience.
          </p>
        </div>

        {/* Mission Ultra-Short */}
        <div className="px-3 py-6">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-bold mb-3">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Democratizing smart sports betting with advanced analytics tools and an engaged community to transform your betting experience.
            </p>
          </div>
        </div>

        {/* Compact Values */}
        <div className="px-3 py-6 bg-muted/30">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-center mb-6">Our Values</h3>
            <div className="grid grid-cols-1 gap-4">
              {values.map((value, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border border-primary/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{value.title}</h4>
                      <p className="text-xs text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Simple Contact */}
        <div className="px-3 py-8 text-center">
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <div className="max-w-md mx-auto space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/support')}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Customer Support
            </Button>
          </div>
        </div>

        {/* Useful Links */}
        <div className="px-3 py-6 bg-muted/20">
          <div className="max-w-md mx-auto">
            <h4 className="text-sm font-medium mb-3 text-center">Legal Information</h4>
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/privacy')}
                className="justify-between h-auto py-2"
              >
                <span className="text-xs">Privacy Policy</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/terms')}
                className="justify-between h-auto py-2"
              >
                <span className="text-xs">Terms of Use</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="px-3 py-4 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Version 1.0.0 • Last updated January 2025
          </p>
        </div>
      </div>
    </Layout>
  );
}
