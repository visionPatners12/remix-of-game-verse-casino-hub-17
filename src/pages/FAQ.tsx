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
      category: "Comptes et Sécurité",
      questions: [
        {
          question: "Comment créer un compte ?",
          answer: "Cliquez sur 'S'inscrire', remplissez vos informations et vérifiez votre email."
        },
        {
          question: "Comment sécuriser mon compte ?",
          answer: "Activez l'authentification à deux facteurs et utilisez un mot de passe fort."
        },
        {
          question: "Mot de passe oublié ?",
          answer: "Cliquez sur 'Mot de passe oublié' et suivez les instructions par email."
        }
      ]
    },
    {
      category: "Paiements",
      questions: [
        {
          question: "Quels moyens de paiement ?",
          answer: "Cartes bancaires, PayPal, cryptomonnaies, Mobile Money et virements."
        },
        {
          question: "Comment retirer mes gains ?",
          answer: "Allez dans Portefeuille > Retirer, choisissez votre méthode et confirmez."
        },
        {
          question: "Y a-t-il des frais ?",
          answer: "Dépôts gratuits. Frais de retrait: 0% crypto, 2% cartes, 1% Mobile Money."
        }
      ]
    },
    {
      category: "Paris et Jeux",
      questions: [
        {
          question: "Comment créer un pari ?",
          answer: "Allez dans Sports, sélectionnez un match, définissez votre mise et partagez."
        },
        {
          question: "Système peer-to-peer ?",
          answer: "Vous pariez directement contre d'autres joueurs, pas contre la maison."
        },
        {
          question: "Rejoindre un jeu classique ?",
          answer: "Allez dans Games, choisissez votre jeu et rejoignez une partie."
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
            Réponses aux questions fréquentes
          </p>
        </div>

        {/* Search mobile optimized */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher..."
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
              <h3 className="text-lg font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe est là 24h/24 et 7j/7
              </p>
              <div className="space-y-2">
                <a href="/support" className="block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
                  Contacter le Support
                </a>
                <a href="/messages" className="block border border-primary text-primary px-4 py-2 rounded-lg text-sm">
                  Chat en Direct
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
