
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, TrendingUp, BookOpen, Target, Calendar, Eye, Loader2 } from 'lucide-react';
import { GradeChart } from './GradeChart';
import { SubjectAverageChart } from './SubjectAverageChart';
import { GradeDistributionChart } from './GradeDistributionChart';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Grade {
  id: string;
  subject: string;
  value: number;
  date: string;
  description: string;
  type: 'oral' | 'written' | 'practical';
}

export interface Subject {
  name: string;
  grades: Grade[];
  average: number;
}

interface DashboardProps {
  userData: {
    token: string;
    user: {
      id: string;
      name: string;
      username: string;
    };
  };
  onLogout: () => void;
}

export const Dashboard = ({ userData, onLogout }: DashboardProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      console.log('Fetching grades from ClasseViva...');

      const { data, error } = await supabase.functions.invoke('classeviva-grades', {
        body: {
          token: userData.token,
          userId: userData.user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.subjects) {
        setSubjects(data.subjects);
        toast({
          title: "Voti caricati",
          description: `Trovate ${data.subjects.length} materie`,
        });
      }

    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Errore nel caricamento",
        description: error instanceof Error ? error.message : "Errore nel recupero dei voti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcola la media generale
  const overallAverage = subjects.length > 0 
    ? subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length 
    : 0;
  
  // Conta il totale dei voti
  const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);

  // Trova la materia con media più alta
  const bestSubject = subjects.length > 0 
    ? subjects.reduce((best, current) => current.average > best.average ? current : best)
    : null;

  // Mostra solo le prime 4 materie se showAllSubjects è false
  const displayedSubjects = showAllSubjects ? subjects : subjects.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dati da ClasseViva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ClasseViva Media</h1>
                <p className="text-sm text-gray-500">{userData.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={fetchGrades} className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Aggiorna
              </Button>
              <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nessun voto trovato</h2>
            <p className="text-gray-600 mb-4">Non sono stati trovati voti per questo account.</p>
            <Button onClick={fetchGrades} className="flex items-center gap-2 mx-auto">
              <TrendingUp className="w-4 h-4" />
              Riprova
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Media Generale</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{overallAverage.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Su {subjects.length} materie</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totale Voti</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGrades}</div>
                  <p className="text-xs text-muted-foreground">Voti inseriti</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Materia Migliore</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bestSubject?.name || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    Media: {bestSubject?.average.toFixed(2) || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ultimo Aggiornamento</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ora</div>
                  <p className="text-xs text-muted-foreground">Dati da ClasseViva</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Andamento Voti nel Tempo</CardTitle>
                  <CardDescription>Visualizza l'evoluzione dei tuoi voti</CardDescription>
                </CardHeader>
                <CardContent>
                  <GradeChart subjects={subjects} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media per Materia</CardTitle>
                  <CardDescription>Confronta le tue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubjectAverageChart subjects={subjects} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Distribuzione Voti</CardTitle>
                  <CardDescription>Analisi della frequenza dei voti</CardDescription>
                </CardHeader>
                <CardContent>
                  <GradeDistributionChart subjects={subjects} />
                </CardContent>
              </Card>

              {/* Subjects List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Riepilogo Materie</CardTitle>
                    <CardDescription>Le tue materie e medie</CardDescription>
                  </div>
                  {subjects.length > 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllSubjects(!showAllSubjects)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {showAllSubjects ? 'Mostra Meno' : 'Vedi Tutte'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayedSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{subject.name}</p>
                        <p className="text-xs text-gray-500">{subject.grades.length} voti</p>
                      </div>
                      <Badge variant={subject.average >= 8 ? 'default' : subject.average >= 6 ? 'secondary' : 'destructive'}>
                        {subject.average.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                  {!showAllSubjects && subjects.length > 4 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        E altre {subjects.length - 4} materie...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
