import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { FAQSchema } from "@/components/seo/FAQSchema";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Accounts & Security",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click on 'Sign Up', fill in your information and verify your email."
        },
        {
          question: "How do I secure my account?",
          answer: "Enable two-factor authentication and use a strong password."
        },
        {
          question: "Forgot your password?",
          answer: "Click on 'Forgot Password' and follow the email instructions."
        }
      ]
    },
    {
      category: "Payments",
      questions: [
        {
          question: "What payment methods are available?",
          answer: "Credit cards, PayPal, cryptocurrencies, Mobile Money and bank transfers."
        },
        {
          question: "How do I withdraw my winnings?",
          answer: "Go to Wallet > Withdraw, choose your method and confirm."
        },
        {
          question: "Are there any fees?",
          answer: "Free deposits. Withdrawal fees: 0% crypto, 2% cards, 1% Mobile Money."
        }
      ]
    },
    {
      category: "Betting & Games",
      questions: [
        {
          question: "How do I place a bet?",
          answer: "Go to Sports, select a match, set your stake and share."
        },
        {
          question: "Peer-to-peer system?",
          answer: "You bet directly against other players, not against the house."
        },
        {
          question: "How to join a classic game?",
          answer: "Go to Games, choose your game and join a match."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Flatten FAQs for schema
  const allFaqs = useMemo(() => 
    faqs.flatMap(cat => cat.questions),
  []);

  return (
    <Layout>
      <PageSEO
        title="FAQ - Frequently Asked Questions | PRYZEN"
        description="Find answers to common questions about PRYZEN: accounts, security, payments, betting, and games. 24/7 support available."
        keywords="PRYZEN FAQ, help, support, questions, betting help, account help"
        canonical="/faq"
      />
      <FAQSchema faqs={allFaqs} />
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            FAQ
          </h1>
          <p className="text-sm text-muted-foreground">
            Answers to frequently asked questions
          </p>
        </div>

        {/* Search mobile optimized */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FAQ sections */}
        <div className="space-y-4">
          {filteredFaqs.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left text-sm py-3">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact support */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our team is available 24/7
              </p>
              <div className="space-y-2">
                <a href="/support" className="block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                  Contact Support
                </a>
                <a href="/messages" className="block border border-primary text-primary px-4 py-2 rounded-lg text-sm">
                  Live Chat
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
