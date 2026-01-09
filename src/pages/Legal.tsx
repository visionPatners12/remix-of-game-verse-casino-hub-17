import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Shield, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';

export default function Legal() {
  const navigate = useNavigate();

  return (
    <Layout hideNavigation>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <MobilePageHeader title="Legal Notice" />

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Legal Information
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All legal and regulatory information about our platform
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          
          {/* Company Information */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Company Name</h4>
                  <p className="text-muted-foreground">PRYZEN SAS</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Legal Form</h4>
                  <p className="text-muted-foreground">Simplified Joint Stock Company</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Share Capital</h4>
                  <p className="text-muted-foreground">€1,000,000</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Registration Number</h4>
                  <p className="text-muted-foreground">123 456 789 00012</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Activity Code</h4>
                  <p className="text-muted-foreground">6201Z</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">VAT Number</h4>
                  <p className="text-muted-foreground">FR12345678901</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <h4 className="font-semibold text-foreground mb-2">Registered Address</h4>
                <p className="text-muted-foreground">
                  123 Sports Avenue<br />
                  75001 Paris, France
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Representative */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Legal Representative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">President</h4>
                  <p className="text-muted-foreground">Jean Dupont</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Contact</h4>
                  <p className="text-muted-foreground">
                    Email: legal@pryzen.com<br />
                    Phone: +33 1 23 45 67 89
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Information */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Publishing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Publication Director</h4>
                <p className="text-muted-foreground">Marie Martin</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Hosting Provider</h4>
                <p className="text-muted-foreground">
                  Supabase Inc.<br />
                  San Francisco, CA, USA
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Personal Data</h4>
                <p className="text-muted-foreground">
                  Data Protection Officer: dpo@pryzen.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gaming License */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Gaming License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Regulatory Authority</h4>
                <p className="text-muted-foreground">National Gaming Authority (ANJ)</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">License Number</h4>
                <p className="text-muted-foreground">ANJ-2024-001-123456</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Issue Date</h4>
                <p className="text-muted-foreground">January 15, 2024</p>
              </div>
              <div className="pt-3 border-t border-orange-200">
                <p className="text-sm text-orange-700 bg-orange-100/50 p-3 rounded-lg">
                  ⚠️ <strong>Warning:</strong> Gambling involves risks. Debt, isolation, addiction. 
                  For help, call 1-800-522-4700 (toll-free).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                All elements of this site (texts, images, logos, trademarks, etc.) are protected 
                by intellectual property rights. Any reproduction, even partial, is strictly 
                prohibited without prior authorization.
              </p>
              <p className="text-muted-foreground">
                The trademarks and logos on this site are the property of their respective owners.
              </p>
            </CardContent>
          </Card>

          {/* Footer Legal Links */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => navigate('/terms')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Terms of Use
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/privacy')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}