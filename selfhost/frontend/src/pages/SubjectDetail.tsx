
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SubjectDetail: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const { user } = useAuth();

  // Questo componente dovrebbe recuperare i dati della materia specifica
  // Per ora mostra solo il nome della materia

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                ← Indietro
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {decodeURIComponent(subjectName || '')}
                </h1>
                <p className="text-gray-600">Dettagli materia per {user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Voti di {decodeURIComponent(subjectName || '')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Qui verranno mostrati tutti i voti e le statistiche per questa materia.
            </p>
            {/* Implementa qui la logica per mostrare i voti della materia specifica */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubjectDetail;
