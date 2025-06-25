
import { useState } from 'react';
import { LoginForm, LoginCredentials } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting ClasseViva login...');
      
      // Chiamata alla Edge Function per l'autenticazione ClasseViva
      const { data, error: functionError } = await supabase.functions.invoke('classeviva-auth', {
        body: {
          username: credentials.username,
          password: credentials.password
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Errore di connessione');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success) {
        setUserData({
          token: data.token,
          user: data.user
        });
        setIsAuthenticated(true);
        
        toast({
          title: "Login effettuato con successo!",
          description: `Benvenuto ${data.user.name}`,
        });
      } else {
        throw new Error('Risposta inaspettata dal server');
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
    setUserData(null);
    setError(null);
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso da ClasseViva",
    });
  };

  if (isAuthenticated && userData) {
    return (
      <Dashboard 
        onLogout={handleLogout} 
        userData={userData}
      />
    );
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
