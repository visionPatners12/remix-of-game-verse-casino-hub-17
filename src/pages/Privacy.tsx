import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Lock, Database, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";

export default function Privacy() {
  const navigate = useNavigate();

  const essentials = [
    "Your data is encrypted and secure",
    "We never sell your personal information",
    "You control your data under GDPR",
    "DPO contact available for any questions"
  ];

  const sections = [
    {
      title: "Data & Usage",
      content: "We only collect necessary data: registration information, game statistics, and technical data. They are used to provide our services, ensure security, and improve user experience."
    },
    {
      title: "Security & Protection",
      content: "SSL/TLS encryption, secure authentication, protected storage, and regular audits ensure the protection of your information."
    },
    {
      title: "Your GDPR Rights",
      content: "Access, rectification, deletion, data portability, and objection to processing. Contact our DPO to exercise your rights."
    },
    {
      title: "Cookies & Retention",
      content: "Essential cookies only. Data retention based on your activity and legal obligations (max 7 years for gaming data)."
    },
    {
      title: "Sharing & Transfers",
      content: "Limited sharing with payment partners and legal obligations. International transfers with appropriate GDPR safeguards."
    }
  ];

  return (
    <Layout hideNavigation>
      <PageSEO
        title="Privacy Policy | PRYZEN"
        description="Learn how PRYZEN protects your data. GDPR compliant with encrypted storage, data rights, and transparent privacy practices."
        keywords="PRYZEN privacy, data protection, GDPR, privacy policy, security"
        canonical="/privacy"
      />
      <div className="px-3 py-4 space-y-4" style={{ paddingTop: 'calc(1rem + var(--safe-area-inset-top))' }}>
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Privacy</h1>
            <p className="text-xs text-muted-foreground">Updated January 8, 2025</p>
          </div>
        </div>

        {/* Key visual points - 2 essential cards */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-1">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-xs">Secure</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-1">
                <Database className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-xs">Your Rights</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Essentials - displayed directly */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">The Essentials</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {essentials.map((essential, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <span>{essential}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Detailed sections - compact accordion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`} className="border-b-0">
                  <AccordionTrigger className="text-left text-xs py-2 hover:no-underline">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-2">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact & Actions - simplified */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Questions?</h3>
                <p className="text-xs text-muted-foreground">dpo@pryzen.com</p>
              </div>
              
              <div className="space-y-2">
                <a href="/settings" className="block bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-medium">
                  Privacy Settings
                </a>
                <a href="/support" className="block border border-border text-foreground px-4 py-2 rounded-lg text-xs">
                  Contact DPO
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
