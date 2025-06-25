
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, BookOpen, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Subject, Grade } from '@/components/Dashboard';

interface SubjectDetailProps {
  subjects: Subject[];
}

export const SubjectDetail = ({ subjects }: SubjectDetailProps) => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (subjectName && subjects.length > 0) {
      const decodedSubjectName = decodeURIComponent(subjectName);
      const foundSubject = subjects.find(s => s.name === decodedSubjectName);
      setSubject(foundSubject || null);
    }
  }, [subjectName, subjects]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Materia non trovata</h2>
          <p className="text-gray-600 mb-4">La materia richiesta non è stata trovata.</p>
          <Button onClick={() => navigate('/')} className="flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Torna alla Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Separiamo i voti per tipo
  const oralGrades = subject.grades.filter(grade => grade.type === 'oral');
  const writtenGrades = subject.grades.filter(grade => grade.type === 'written');

  // Calcoliamo le medie per tipo
  const oralAverage = oralGrades.length > 0 
    ? oralGrades.reduce((sum, grade) => sum + grade.value, 0) / oralGrades.length 
    : 0;

  const writtenAverage = writtenGrades.length > 0 
    ? writtenGrades.reduce((sum, grade) => sum + grade.value, 0) / writtenGrades.length 
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getGradeColor = (value: number) => {
    if (value >= 8) return 'bg-green-100 text-green-800';
    if (value >= 7) return 'bg-blue-100 text-blue-800';
    if (value >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const GradeTable = ({ grades, title }: { grades: Grade[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {grades.length} voti - Media: {grades.length > 0 ? 
            (grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length).toFixed(2) : 
            'N/A'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {grades.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Periodo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>
                    <Badge className={getGradeColor(grade.value)}>
                      {grade.originalValue || grade.value}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(grade.date)}
                  </TableCell>
                  <TableCell>{grade.description}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {grade.teacher}
                  </TableCell>
                  <TableCell>{grade.period}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nessun voto {title.toLowerCase()} trovato
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{subject.name}</h1>
                <p className="text-sm text-gray-500">Dettaglio voti</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Generale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{subject.average}</div>
              <p className="text-xs text-muted-foreground">Su {subject.grades.length} voti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voti Orali</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{oralGrades.length}</div>
              <p className="text-xs text-muted-foreground">
                Media: {oralAverage > 0 ? oralAverage.toFixed(2) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voti Scritti</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{writtenGrades.length}</div>
              <p className="text-xs text-muted-foreground">
                Media: {writtenAverage > 0 ? writtenAverage.toFixed(2) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Voto</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subject.grades.length > 0 ? 
                  subject.grades[subject.grades.length - 1].originalValue || 
                  subject.grades[subject.grades.length - 1].value : 
                  'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {subject.grades.length > 0 ? 
                  formatDate(subject.grades[subject.grades.length - 1].date) : 
                  'Nessun voto'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs per voti */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tutti i Voti</TabsTrigger>
            <TabsTrigger value="oral">Voti Orali</TabsTrigger>
            <TabsTrigger value="written">Voti Scritti</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <GradeTable grades={subject.grades} title="Tutti i Voti" />
          </TabsContent>
          
          <TabsContent value="oral" className="space-y-6">
            <GradeTable grades={oralGrades} title="Voti Orali" />
          </TabsContent>
          
          <TabsContent value="written" className="space-y-6">
            <GradeTable grades={writtenGrades} title="Voti Scritti" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SubjectDetail;
