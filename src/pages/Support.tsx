import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Wallet, ChevronRight, MessageCircle } from "lucide-react";
import { SupportTickets } from "@/components/support/SupportTickets";
import { CreateTicketDialog } from "@/components/support/CreateTicketDialog";
import { useNavigate } from "react-router-dom";
import { MobilePageHeader } from "@/components/shared/MobilePageHeader";
import { FaTelegram, FaDiscord, FaWhatsapp } from "react-icons/fa";
import { PageSEO } from "@/components/seo/PageSEO";

export default function Support() {
  const navigate = useNavigate();

  const socialLinks = [
    {
      name: "Telegram",
      handle: "@pryzenx",
      url: "https://t.me/pryzenx",
      icon: FaTelegram,
      color: "text-[#0088cc]"
    },
    {
      name: "Telegram",
      handle: "@pryzen_x",
      url: "https://t.me/pryzen_x",
      icon: FaTelegram,
      color: "text-[#0088cc]"
    },
    {
      name: "Discord",
      handle: "Join our server",
      url: "https://discord.gg/pryzen",
      icon: FaDiscord,
      color: "text-[#5865F2]"
    },
    {
      name: "WhatsApp",
      handle: "Chat with us",
      url: "https://wa.me/message/pryzen",
      icon: FaWhatsapp,
      color: "text-[#25D366]"
    }
  ];

  return (
    <Layout hideNavigation>
      <PageSEO
        title="Customer Support 24/7 | PRYZEN"
        description="Get help from PRYZEN support team. Contact us via email, Telegram, Discord, or WhatsApp. Create support tickets and get quick answers."
        keywords="PRYZEN support, help, contact, customer service, tickets"
        canonical="/support"
      />
      <div className="min-h-screen bg-background">
        <MobilePageHeader title="Customer Support" />
        
        <div className="px-4 py-6 space-y-6">

        {/* Contact par email */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">support@pryzen.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <div className="grid grid-cols-3 gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                  <link.icon className={`h-6 w-6 ${link.color}`} />
                  <div>
                    <h3 className="font-medium text-sm">{link.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{link.handle}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* How to Add Funds */}
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/how-to-add-funds')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">How to Add Funds</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to deposit money to your account
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Support tickets section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">My Tickets</h2>
            <CreateTicketDialog />
          </div>
          <SupportTickets />
        </div>
        </div>
      </div>
    </Layout>
  );
}
