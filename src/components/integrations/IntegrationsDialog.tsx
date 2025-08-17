import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import WhatsAppConfig from './WhatsAppConfig';
import GoogleCalendarConfig from './GoogleCalendarConfig';
import OpenAIConfig from './OpenAIConfig';
import { MessageSquare, Calendar, Brain } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  configuration?: any;
}

interface IntegrationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
}

const IntegrationsDialog = ({ open, onOpenChange, agent }: IntegrationsDialogProps) => {
  const [whatsappConnection, setWhatsappConnection] = useState(null);
  const [calendarConnection, setCalendarConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!agent?.id) return;

    setLoading(true);
    try {
      // Fetch WhatsApp connection
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('agent_id', agent.id)
        .single();

      if (!whatsappError) {
        setWhatsappConnection(whatsappData);
      }

      // Fetch Calendar connection
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('agent_id', agent.id)
        .single();

      if (!calendarError) {
        setCalendarConnection(calendarData);
      }
    } catch (error: any) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && agent) {
      fetchConnections();
    }
  }, [open, agent]);

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">
                Configurar Integrações
              </DialogTitle>
              <p className="text-muted-foreground">
                Agente: {agent.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="openai" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="openai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>OpenAI</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Google Calendar</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="openai" className="space-y-0">
              <OpenAIConfig
                agentId={agent.id}
                configuration={agent.configuration}
                onConfigUpdate={fetchConnections}
              />
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-0">
              <WhatsAppConfig
                agentId={agent.id}
                connection={whatsappConnection}
                onConnectionUpdate={fetchConnections}
              />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-0">
              <GoogleCalendarConfig
                agentId={agent.id}
                connection={calendarConnection}
                onConnectionUpdate={fetchConnections}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationsDialog;