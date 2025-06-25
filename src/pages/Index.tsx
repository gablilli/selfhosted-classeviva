
import { useState } from 'react';
import { LoginForm, LoginCredentials } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simula chiamata API di login a ClasseViva
      console.log('Tentativo di login ClasseViva con:', credentials);
      
      // Per la demo, accetta qualsiasi credenziale con almeno 3 caratteri
      // Nell'implementazione reale useremo Supabase Edge Functions per chiamare l'API ClasseViva
      if (credentials.username.length >= 3 && credentials.password.length >= 3) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay API
        
        setIsAuthenticated(true);
        toast({
          title: "Login effettuato con successo!",
          description: "Benvenuto nella dashboard ClasseViva Media",
        });
      } else {
        throw new Error('Credenziali non valide. Username e password devono avere almeno 3 caratteri.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il login con ClasseViva';
      setError(errorMessage);
      toast({
        title: "Errore di login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setError(null);
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso da ClasseViva",
    });
  };

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <LoginForm 
      onLogin={handleLogin} 
      isLoading={isLoading}
      error={error || undefined}
    />
  );
};

export default Index;
