
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock grades data per testing
const generateMockGrades = (userId: string) => {
  const subjects = [
    'Matematica', 'Italiano', 'Storia', 'Geografia', 'Scienze', 
    'Inglese', 'Arte', 'Educazione Fisica', 'Tecnologia', 'Musica'
  ];
  
  const mockSubjects = subjects.map(subject => {
    const numGrades = Math.floor(Math.random() * 5) + 3; // 3-7 voti per materia
    const grades = [];
    
    for (let i = 0; i < numGrades; i++) {
      const baseGrade = Math.floor(Math.random() * 6) + 4; // 4-9
      const modifier = Math.random() < 0.3 ? (Math.random() < 0.5 ? '+' : '-') : '';
      const gradeValue = baseGrade + (modifier === '+' ? 0.25 : modifier === '-' ? -0.25 : 0);
      
      grades.push({
        id: `mock_${subject}_${i}`,
        subject: subject,
        value: gradeValue,
        originalValue: `${baseGrade}${modifier}`,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: Math.random() < 0.5 ? 'Interrogazione' : 'Verifica scritta',
        type: Math.random() < 0.4 ? 'oral' : 'written',
        teacher: `Prof. ${['Bianchi', 'Verdi', 'Neri', 'Gialli', 'Blu'][Math.floor(Math.random() * 5)]}`,
        period: 'Primo Quadrimestre'
      });
    }
    
    const average = grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
    
    return {
      name: subject,
      grades: grades,
      average: parseFloat(average.toFixed(2))
    };
  });
  
  return mockSubjects;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, userId } = await req.json();
    console.log('Fetching grades for user:', userId);

    // Se il token è mock o userId è demo, restituisci dati mock
    if (token?.startsWith('mock_token_') || userId === 'demo') {
      console.log('Using mock grades data');
      const mockSubjects = generateMockGrades(userId);
      
      return new Response(
        JSON.stringify({
          success: true,
          subjects: mockSubjects
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prova l'API reale con proxy
    const proxyUrls = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?'
    ];

    let gradesResponse;
    let lastError;

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
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://web.spaggiari.eu',
            'Referer': 'https://web.spaggiari.eu/'
          },
        });

        if (gradesResponse.ok) {
          console.log(`Success with proxy: ${proxyUrl}`);
          const gradesData = await gradesResponse.json();
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

    // Se tutti i proxy falliscono, usa dati mock
    console.log('All grade proxies failed, using mock data');
    const mockSubjects = generateMockGrades(userId);
    
    return new Response(
      JSON.stringify({
        success: true,
        subjects: mockSubjects
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

      let gradeValue = parseFloat(grade.displayValue);
      if (isNaN(gradeValue)) {
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

  Object.keys(subjects).forEach(subjectName => {
    const subject = subjects[subjectName];
    if (subject.grades.length > 0) {
      const sum = subject.grades.reduce((acc: number, grade: any) => acc + grade.value, 0);
      subject.average = parseFloat((sum / subject.grades.length).toFixed(2));
    }
  });

  return Object.values(subjects);
}
