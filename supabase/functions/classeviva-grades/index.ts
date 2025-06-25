
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

    // Chiamata all'API di ClasseViva per ottenere i voti
    const gradesResponse = await fetch(`https://web.spaggiari.eu/rest/v1/students/${userId}/grades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClasseVivaApp/1.0',
        'Z-Dev-Apikey': '+zorro+',
        'Z-Auth-Token': token,
      },
    });

    if (!gradesResponse.ok) {
      const errorData = await gradesResponse.text();
      console.error('ClasseViva grades API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Errore nel recupero dei voti',
          details: errorData 
        }),
        {
          status: gradesResponse.status,
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
          date: grade.evtDate || new Date().toISOString().split('T')[0],
          description: grade.notesForFamily || grade.componentDesc || 'Voto',
          type: grade.componentDesc?.toLowerCase().includes('oral') ? 'oral' : 'written'
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
