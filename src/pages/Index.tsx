import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import AgentCard from '@/components/dashboard/AgentCard';
import CreateAgentDialog from '@/components/dashboard/CreateAgentDialog';
import IntegrationsDialog from '@/components/integrations/IntegrationsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bot } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  whatsapp_connected: boolean;
  calendar_connected: boolean;
  created_at: string;
}

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [integrationsDialogOpen, setIntegrationsDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAgents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing from database
      const typedAgents = (data || []).map(agent => ({
        ...agent,
        status: agent.status as 'active' | 'inactive' | 'error'
      }));
      
      setAgents(typedAgents);
    } catch (error: any) {
      toast({
        title: "Error loading agents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus as 'active' | 'inactive' | 'error' } : agent
      ));

      toast({
        title: `Agent ${newStatus}`,
        description: `Agent has been ${newStatus}d successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  const handleEditAgent = (agent: Agent) => {
    // TODO: Implement edit functionality
    toast({
      title: "Editar Agente",
      description: "Edição de agentes em breve!",
    });
  };

  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIntegrationsDialogOpen(true);
  };

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const connectedServices = agents.reduce((count, agent) => {
    return count + (agent.whatsapp_connected ? 1 : 0) + (agent.calendar_connected ? 1 : 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg animate-pulse shadow-glow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onCreateAgent={() => setCreateDialogOpen(true)} />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <DashboardStats 
          totalAgents={agents.length}
          activeAgents={activeAgents}
          totalConversations={0} // TODO: Implement conversation counting
          connectedServices={connectedServices}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your AI Agents</h2>
              <p className="text-muted-foreground">Manage and orchestrate your AI assistants</p>
            </div>
          </div>

          {agents.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto shadow-glow">
                  <Bot className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-foreground">No Agents Yet</CardTitle>
                <CardDescription className="text-muted-foreground max-w-md mx-auto">
                  Get started by creating your first AI agent. Connect it to WhatsApp and Google Calendar to automate your workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={handleEditAgent}
                  onConfigure={handleConfigureAgent}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateAgentDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onAgentCreated={fetchAgents}
      />

      <IntegrationsDialog
        open={integrationsDialogOpen}
        onOpenChange={setIntegrationsDialogOpen}
        agent={selectedAgent}
      />
    </div>
  );
};

export default Index;
