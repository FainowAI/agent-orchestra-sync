import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, Check, AlertTriangle } from 'lucide-react';

interface GoogleCalendarConfigProps {
  agentId: string;
  connection?: {
    id: string;
    calendar_id: string;
    status: string;
  };
  onConnectionUpdate: () => void;
}

const GoogleCalendarConfig = ({ agentId, connection, onConnectionUpdate }: GoogleCalendarConfigProps) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const connectGoogleCalendar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-google-calendar', {
        body: { agentId }
      });

      if (error) throw error;

      // Redireciona para a URL de autorização do Google
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Erro na conexão",
        description: error.message || "Falha ao conectar com Google Calendar",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const testCalendarConnection = async () => {
    if (!connection?.id) return;

    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke('test-calendar-connection', {
        body: { connectionId: connection.id }
      });

      if (error) throw error;

      toast({
        title: "Conexão Testada",
        description: "Google Calendar está funcionando corretamente!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao testar conexão com Google Calendar",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected': return <Check className="w-4 h-4 text-success" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Google Calendar</CardTitle>
            <CardDescription className="text-muted-foreground">
              Conecte seu agente ao Google Calendar para automação de agendamentos
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(connection.status)}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Calendar ID: {connection.calendar_id}
                  </p>
                  <p className={`text-xs ${getStatusColor(connection.status)}`}>
                    Status: {connection.status}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={testCalendarConnection}
                disabled={testing}
              >
                {testing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Testar Conexão
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">Eventos Criados</p>
                <p className="text-lg font-medium text-foreground">0</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">Automações Ativas</p>
                <p className="text-lg font-medium text-foreground">0</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Conectar Google Calendar
              </h4>
              <p className="text-xs text-muted-foreground">
                Autorize o acesso ao seu Google Calendar para permitir que o agente 
                crie, edite e gerencie eventos automaticamente.
              </p>
            </div>

            <Button
              onClick={connectGoogleCalendar}
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Conectar com Google
            </Button>
          </div>
        )}

        <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-info mt-0.5" />
            <div className="text-xs text-info">
              <p className="font-medium">Funcionalidades:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Criação automática de eventos via WhatsApp</li>
                <li>Consulta de disponibilidade</li>
                <li>Cancelamento e reagendamento</li>
                <li>Notificações automáticas</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarConfig;