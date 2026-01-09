import React from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Coming Soon Message */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Messages</h2>
          <p className="text-muted-foreground mb-4">
            La messagerie arrive bientôt !
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-muted text-sm font-medium">
            Coming Soon
          </div>
        </Card>
      </div>
    </div>
  );
}
