
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

    // Chiamata all'API di ClasseViva per il login
    const loginResponse = await fetch('https://web.spaggiari.eu/rest/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClasseVivaApp/1.0',
        'Z-Dev-Apikey': '+zorro+',
      },
      body: JSON.stringify({
        ident: username,
        pass: password,
      }),
    });

    console.log('ClasseViva API response status:', loginResponse.status);

    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.error('ClasseViva API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Credenziali non valide o errore del server ClasseViva',
          details: errorData 
        }),
        {
          status: 401,
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
