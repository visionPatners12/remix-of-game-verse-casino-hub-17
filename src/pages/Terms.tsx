import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, AlertTriangle, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By using PRYZEN, you accept these terms of use. If you do not accept these terms, please do not use our services."
    },
    {
      title: "2. Service Description",
      content: "PRYZEN is an online gaming platform that allows users to play classic games, participate in peer-to-peer betting, and interact with other players."
    },
    {
      title: "3. Eligibility",
      content: "You must be at least 18 years old to use our services. Use is subject to the laws of your jurisdiction regarding online gaming."
    },
    {
      title: "4. User Account",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized access."
    },
    {
      title: "5. Code of Conduct",
      content: "Users must maintain fair and sportsmanlike behavior. Any form of cheating, manipulation, or abusive behavior is strictly prohibited."
    },
    {
      title: "6. Payments and Withdrawals",
      content: "All payments are processed securely. Withdrawals are subject to identity verification and may take 24-48 hours to process."
    },
    {
      title: "7. Intellectual Property",
      content: "All content on PRYZEN, including logos, text, graphics, and software, is protected by copyright and other intellectual property rights."
    },
    {
      title: "8. Limitation of Liability",
      content: "PRYZEN shall not be liable for indirect, incidental, or consequential damages resulting from the use of our services."
    },
    {
      title: "9. Termination",
      content: "We reserve the right to suspend or terminate your account in case of violation of these terms of use."
    },
    {
      title: "10. Modifications",
      content: "We may modify these terms at any time. Users will be notified of significant changes by email or platform notification."
    }
  ];

  return (
    <Layout hideNavigation>
      <PageSEO
        title="Terms of Use | PRYZEN"
        description="Read PRYZEN's terms of use. Learn about eligibility, user accounts, payments, code of conduct, and legal information."
        keywords="PRYZEN terms, terms of use, legal, conditions, user agreement"
        canonical="/terms"
      />
      <div className="px-4 py-6 space-y-6" style={{ paddingTop: 'calc(1.5rem + var(--safe-area-inset-top))' }}>
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Terms of Use
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: January 8, 2025
            </p>
          </div>
        </div>

        {/* Important notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-orange-800 mb-1">Important</h3>
                <p className="text-xs text-orange-700">
                  Please read these terms carefully before using our services. 
                  Using PRYZEN implies your acceptance of these terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms sections */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">General Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`}>
                  <AccordionTrigger className="text-left text-sm py-3">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Legal info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">PRYZEN SAS</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Headquarters: 123 Tech Avenue, 75001 Paris, France</p>
                <p>Registration: 123 456 789 00012</p>
                <p>VAT: FR12345678901</p>
                <p>Publication Director: Alexandre Martin</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Hosting</h4>
              <div className="text-xs text-muted-foreground">
                <p>Supabase Inc.</p>
                <p>San Francisco, CA, USA</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Applicable Law</h4>
              <p className="text-xs text-muted-foreground">
                These terms are governed by French law. 
                Any dispute will be submitted to the competent courts of Paris.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For any questions regarding these terms
              </p>
              <a href="/support" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                Contact Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}