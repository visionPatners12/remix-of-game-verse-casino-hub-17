import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface EmailRequest {
  template: 'welcome' | 'notification' | 'reset-password' | 'verification';
  to: string;
  data: {
    firstName?: string;
    username?: string;
    isWalletUser?: boolean;
    [key: string]: any;
  };
}

// Templates HTML
const getTemplate = (template: string, data: any): { subject: string; html: string } => {
  const name = data.firstName || data.username || 'Champion';
  
  switch (template) {
    case 'welcome':
      return {
        subject: `🎉 Bienvenue sur PRYZEN, ${name} !`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue sur PRYZEN</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
              .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
              .header-text { color: white; font-size: 18px; opacity: 0.9; }
              .content { padding: 40px 30px; }
              .welcome-text { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
              .feature { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9ff; border-radius: 8px; }
              .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 20px; }
              .feature-text { font-size: 16px; color: #555; }
              .cta { text-align: center; margin: 40px 0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
              .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #888; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">PRYZEN</div>
                <div class="header-text">La plateforme de paris sportifs nouvelle génération</div>
              </div>
              
              <div class="content">
                <div class="welcome-text">Bienvenue ${name} ! 🎉</div>
                <p>Félicitations ! Votre compte PRYZEN est maintenant configuré et prêt à l'emploi.</p>
                
                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-text"><strong>Paris Sportifs Intelligents</strong><br>Accédez aux meilleures cotes et analyses</div>
                </div>
                
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <div class="feature-text"><strong>Communauté Active</strong><br>Partagez vos pronostics et suivez les experts</div>
                </div>
                
                ${data.isWalletUser ? `
                <div class="feature">
                  <div class="feature-icon">🔗</div>
                  <div class="feature-text"><strong>Wallet Connecté</strong><br>Profitez de l'expérience Web3 complète</div>
                </div>
                ` : `
                <div class="feature">
                  <div class="feature-icon">📊</div>
                  <div class="feature-text"><strong>Statistiques Avancées</strong><br>Analysez vos performances en temps réel</div>
                </div>
                `}
                
                <div class="cta">
                  <a href="https://pryzen.com/dashboard" class="cta-button">Commencer à parier 🚀</a>
                </div>
                
                <p>Vous êtes maintenant prêt à découvrir une nouvelle façon de parier. Notre équipe est là pour vous accompagner dans cette aventure !</p>
              </div>
              
              <div class="footer">
                <p><strong>PRYZEN</strong> - La révolution des paris sportifs</p>
                <p>Cette adresse email ne reçoit pas de réponses. Pour toute question, contactez notre support.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
    case 'notification':
      return {
        subject: 'Notification PRYZEN',
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}.container{max-width:500px;margin:0 auto;background:white;border-radius:8px;padding:30px}</style></head>
          <body><div class="container"><h2>Notification</h2><p>Bonjour ${name},</p><p>${data.message || 'Vous avez une nouvelle notification.'}</p></div></body>
          </html>
        `
      };
      
    default:
      return {
        subject: 'PRYZEN',
        html: `<h1>Bonjour ${name}</h1><p>Message de PRYZEN.</p>`
      };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { template, to, data }: EmailRequest = await req.json();
    
    console.log(`📧 Sending ${template} email to ${to}`, { data });
    
    if (!template || !to) {
      return new Response(JSON.stringify({ error: 'Template and to fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { subject, html } = getTemplate(template, data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "PRYZEN <no-reply@pryzen.com>",
        to: [to],
        subject,
        html
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Resend API error:', result);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: result }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('✅ Email sent successfully:', result.id);
    
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: unknown) {
    console.error('❌ Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', message: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});