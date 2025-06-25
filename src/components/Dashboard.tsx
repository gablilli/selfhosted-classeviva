
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, TrendingUp, BookOpen, Target, Calendar } from 'lucide-react';
import { GradeChart } from './GradeChart';
import { SubjectAverageChart } from './SubjectAverageChart';
import { GradeDistributionChart } from './GradeDistributionChart';

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
  user: {
    name: string;
    class: string;
    school: string;
  };
  subjects: Subject[];
  onLogout: () => void;
}

// Mock data per la demo
const mockSubjects: Subject[] = [
  {
    name: 'Matematica',
    average: 7.5,
    grades: [
      { id: '1', subject: 'Matematica', value: 8, date: '2024-01-15', description: 'Verifica equazioni', type: 'written' },
      { id: '2', subject: 'Matematica', value: 7, date: '2024-01-22', description: 'Interrogazione', type: 'oral' },
      { id: '3', subject: 'Matematica', value: 7.5, date: '2024-02-05', description: 'Compito funzioni', type: 'written' },
    ]
  },
  {
    name: 'Italiano',
    average: 8.2,
    grades: [
      { id: '4', subject: 'Italiano', value: 8.5, date: '2024-01-18', description: 'Tema argomentativo', type: 'written' },
      { id: '5', subject: 'Italiano', value: 8, date: '2024-01-25', description: 'Analisi del testo', type: 'oral' },
      { id: '6', subject: 'Italiano', value: 8, date: '2024-02-08', description: 'Letteratura', type: 'oral' },
    ]
  },
  {
    name: 'Storia',
    average: 7.8,
    grades: [
      { id: '7', subject: 'Storia', value: 8, date: '2024-01-20', description: 'Prima guerra mondiale', type: 'oral' },
      { id: '8', subject: 'Storia', value: 7.5, date: '2024-02-01', description: 'Verifica scritta', type: 'written' },
    ]
  },
  {
    name: 'Inglese',
    average: 8.7,
    grades: [
      { id: '9', subject: 'Inglese', value: 9, date: '2024-01-12', description: 'Speaking test', type: 'oral' },
      { id: '10', subject: 'Inglese', value: 8.5, date: '2024-01-28', description: 'Grammar test', type: 'written' },
      { id: '11', subject: 'Inglese', value: 8.5, date: '2024-02-10', description: 'Reading comprehension', type: 'written' },
    ]
  },
  {
    name: 'Scienze',
    average: 7.3,
    grades: [
      { id: '12', subject: 'Scienze', value: 7, date: '2024-01-16', description: 'Sistema nervoso', type: 'oral' },
      { id: '13', subject: 'Scienze', value: 7.5, date: '2024-02-03', description: 'Verifica chimica', type: 'written' },
    ]
  },
];

const mockUser = {
  name: 'Mario Rossi',
  class: '5A',
  school: 'Liceo Scientifico Galilei'
};

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [user] = useState(mockUser);

  // Calcola la media generale
  const overallAverage = subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length;
  
  // Conta il totale dei voti
  const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);

  // Trova la materia con media più alta
  const bestSubject = subjects.reduce((best, current) => 
    current.average > best.average ? current : best
  );

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
                <p className="text-sm text-gray-500">{user.name} - {user.class}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="text-2xl font-bold">{bestSubject.name}</div>
              <p className="text-xs text-muted-foreground">Media: {bestSubject.average.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Aggiornamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Oggi</div>
              <p className="text-xs text-muted-foreground">Dati sincronizzati</p>
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
            <CardHeader>
              <CardTitle>Riepilogo Materie</CardTitle>
              <CardDescription>Tutte le tue materie e medie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject, index) => (
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
