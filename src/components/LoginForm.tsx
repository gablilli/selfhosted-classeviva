
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Loader2, Info } from 'lucide-react';

export interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export const LoginForm = ({ onLogin, isLoading, error }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin({ username, password });
  };

  const handleDemoLogin = async () => {
    await onLogin({ username: 'demo', password: 'demo' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ClasseViva Media</h1>
          <p className="text-gray-600">Accedi per visualizzare i tuoi voti</p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Modalità Demo:</strong> Clicca su "Accesso Demo" per testare l'app con dati di esempio, 
            oppure usa le tue credenziali ClasseViva reali.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Accesso</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali ClasseViva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Codice Fiscale</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Inserisci username o codice fiscale"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la password"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    'Accedi'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Accesso Demo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Hai problemi di accesso? ClasseViva potrebbe essere temporaneamente non disponibile.
            <br />
            Prova la modalità demo per testare l'interfaccia.
          </p>
        </div>
      </div>
    </div>
  );
};
