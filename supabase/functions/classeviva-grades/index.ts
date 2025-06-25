
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
    const { token, userId } = await req.json();

    console.log('Fetching grades for user:', userId);

    // Use multiple proxy strategies to bypass geo-blocking
    const proxyUrls = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?'
    ];

    let gradesResponse;
    let lastError;

    // Try different proxy services
    for (const proxyUrl of proxyUrls) {
      try {
        console.log(`Trying proxy for grades: ${proxyUrl}`);
        
        const targetUrl = `https://web.spaggiari.eu/rest/v1/students/${userId}/grades`;
        const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

        gradesResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
            'Z-Dev-Apikey': '+zorro+',
            'Z-Auth-Token': token,
            'X-Requested-With': 'XMLHttpRequest'
          },
        });

        if (gradesResponse.ok) {
          console.log(`Success with proxy: ${proxyUrl}`);
          break;
        } else {
          console.log(`Failed with proxy ${proxyUrl}: ${gradesResponse.status}`);
          lastError = await gradesResponse.text();
        }
      } catch (error) {
        console.log(`Error with proxy ${proxyUrl}:`, error.message);
        lastError = error.message;
        continue;
      }
    }

    // If all proxies failed, try direct connection with different headers
    if (!gradesResponse || !gradesResponse.ok) {
      console.log('All proxies failed, trying direct connection with enhanced headers...');
      
      try {
        gradesResponse = await fetch(`https://web.spaggiari.eu/rest/v1/students/${userId}/grades`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ClasseVivaApp/1.4.2 (iPhone; iOS 14.7.1; Scale/3.00)',
            'Accept': 'application/json',
            'Accept-Language': 'it-IT,it;q=0.9',
            'Z-Dev-Apikey': '+zorro+',
            'Z-Auth-Token': token,
            'Cache-Control': 'no-cache',
            'X-Forwarded-For': '151.38.39.114', // Italian IP
            'CF-IPCountry': 'IT'
          },
        });
      } catch (error) {
        console.error('Direct connection for grades also failed:', error);
      }
    }

    if (!gradesResponse || !gradesResponse.ok) {
      const errorData = lastError || 'Connection failed';
      console.error('All grade connection attempts failed:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Impossibile recuperare i voti da ClasseViva. Il servizio potrebbe essere temporaneamente non disponibile.',
          details: errorData 
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const gradesData = await gradesResponse.json();
    console.log('Grades fetched successfully');

    // Trasformiamo i dati nel formato atteso dal frontend
    const subjects = processGradesData(gradesData);

    return new Response(
      JSON.stringify({
        success: true,
        subjects
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in classeviva-grades function:', error);
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

function processGradesData(gradesData: any) {
  const subjects: any = {};

  // Processiamo i voti raggruppandoli per materia
  if (gradesData.grades) {
    gradesData.grades.forEach((grade: any) => {
      const subjectName = grade.subjectDesc || grade.subjectCode || 'Materia sconosciuta';
      
      if (!subjects[subjectName]) {
        subjects[subjectName] = {
          name: subjectName,
          grades: [],
          average: 0
        };
      }

      // Convertiamo il voto in numero se possibile
      let gradeValue = parseFloat(grade.displayValue);
      if (isNaN(gradeValue)) {
        // Se non è un numero, proviamo a convertire voti come "6+", "7-", etc.
        const cleanValue = grade.displayValue.replace(/[+-]/g, '');
        gradeValue = parseFloat(cleanValue);
        if (!isNaN(gradeValue)) {
          if (grade.displayValue.includes('+')) gradeValue += 0.25;
          if (grade.displayValue.includes('-')) gradeValue -= 0.25;
        }
      }

      if (!isNaN(gradeValue) && gradeValue > 0) {
        subjects[subjectName].grades.push({
          id: grade.evtId || Math.random().toString(),
          subject: subjectName,
          value: gradeValue,
          originalValue: grade.displayValue,
          date: grade.evtDate || new Date().toISOString().split('T')[0],
          description: grade.notesForFamily || grade.componentDesc || 'Voto',
          type: grade.componentDesc?.toLowerCase().includes('oral') ? 'oral' : 'written',
          teacher: grade.teacherName || 'Docente non specificato',
          period: grade.periodDesc || grade.periodPos || 'Periodo non specificato'
        });
      }
    });
  }

  // Calcoliamo le medie per ogni materia
  Object.keys(subjects).forEach(subjectName => {
    const subject = subjects[subjectName];
    if (subject.grades.length > 0) {
      const sum = subject.grades.reduce((acc: number, grade: any) => acc + grade.value, 0);
      subject.average = parseFloat((sum / subject.grades.length).toFixed(2));
    }
  });

  // Convertiamo l'oggetto in array
  return Object.values(subjects);
}
