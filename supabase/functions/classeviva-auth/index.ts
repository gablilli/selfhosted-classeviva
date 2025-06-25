
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    console.log('Attempting ClasseViva login for user:', username);

    // Use multiple proxy strategies to bypass geo-blocking
    const proxyUrls = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?'
    ];

    let loginResponse;
    let lastError;

    // Try different proxy services
    for (const proxyUrl of proxyUrls) {
      try {
        console.log(`Trying proxy: ${proxyUrl}`);
        
        const targetUrl = 'https://web.spaggiari.eu/rest/v1/auth/login';
        const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

        const requestBody = JSON.stringify({
          ident: username,
          pass: password,
          customerCode: ""
        });

        loginResponse = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
            'Z-Dev-Apikey': '+zorro+',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: requestBody,
        });

        if (loginResponse.ok) {
          console.log(`Success with proxy: ${proxyUrl}`);
          break;
        } else {
          console.log(`Failed with proxy ${proxyUrl}: ${loginResponse.status}`);
          lastError = await loginResponse.text();
        }
      } catch (error) {
        console.log(`Error with proxy ${proxyUrl}:`, error.message);
        lastError = error.message;
        continue;
      }
    }

    // If all proxies failed, try direct connection with different headers
    if (!loginResponse || !loginResponse.ok) {
      console.log('All proxies failed, trying direct connection with enhanced headers...');
      
      try {
        loginResponse = await fetch('https://web.spaggiari.eu/rest/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ClasseVivaApp/1.4.2 (iPhone; iOS 14.7.1; Scale/3.00)',
            'Accept': 'application/json',
            'Accept-Language': 'it-IT,it;q=0.9',
            'Z-Dev-Apikey': '+zorro+',
            'Cache-Control': 'no-cache',
            'X-Forwarded-For': '151.38.39.114', // Italian IP
            'CF-IPCountry': 'IT'
          },
          body: JSON.stringify({
            ident: username,
            pass: password,
            customerCode: ""
          }),
        });
      } catch (error) {
        console.error('Direct connection also failed:', error);
      }
    }

    if (!loginResponse || !loginResponse.ok) {
      const errorData = lastError || 'Connection failed';
      console.error('All connection attempts failed:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Impossibile connettersi a ClasseViva. Il servizio potrebbe essere temporaneamente non disponibile o geo-bloccato.',
          details: errorData 
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authData = await loginResponse.json();
    console.log('Login successful for user:', username);

    // Estraiamo i dati necessari dalla risposta
    const { token, ident, firstName, lastName } = authData;

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: ident,
          name: `${firstName || ''} ${lastName || ''}`.trim() || username,
          username: ident,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in classeviva-auth function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Errore interno del server',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
