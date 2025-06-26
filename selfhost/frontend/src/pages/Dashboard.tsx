
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Grade {
  id: string;
  subject: string;
  value: number;
  date: string;
  description: string;
  type: string;
  teacher: string;
  period: string;
}

interface Subject {
  name: string;
  average: number;
  grades: Grade[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.post('/api/grades', {
        userId: user?.id
      });

      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Errore nel caricamento voti:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallAverage = subjects.length > 0 
    ? subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length 
    : 0;

  const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ClasseViva Dashboard</h1>
              <p className="text-gray-600">Benvenuto, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Media Generale</dt>
                    <dd className="text-lg font-medium text-gray-900">{overallAverage.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">V</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Totale Voti</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalGrades}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Materie</dt>
                    <dd className="text-lg font-medium text-gray-900">{subjects.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Le tue materie</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Clicca su una materia per vedere i dettagli</p>
          </div>
          <ul className="divide-y divide-gray-200">
            {subjects.map((subject, index) => (
              <li key={index}>
                <Link 
                  to={`/subject/${encodeURIComponent(subject.name)}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {subject.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        <div className="text-sm text-gray-500">{subject.grades.length} voti</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        subject.average >= 8 ? 'text-green-600' : 
                        subject.average >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        Media: {subject.average.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
