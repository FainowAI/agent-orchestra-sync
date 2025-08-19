import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, Settings, Activity, Users } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  whatsapp_connected: boolean;
  calendar_connected: boolean;
  created_at: string;
}

interface AgentCardProps {
  agent: Agent;
  conversationCount?: number;
  onEdit: (agent: Agent) => void;
  onConfigure: (agent: Agent) => void;
  onToggleStatus: (agentId: string, currentStatus: string) => void;
}

const AgentCard = ({ agent, conversationCount = 0, onEdit, onConfigure, onToggleStatus }: AgentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'muted';
      case 'error': return 'destructive';
      default: return 'muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 rounded-full bg-success animate-pulse" />;
      case 'inactive': return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
      case 'error': return <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />;
      default: return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card hover:shadow-elevated transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
              {agent.name}
            </CardTitle>
            {agent.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {agent.description}
              </p>
            )}
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onConfigure(agent)}
              className="h-8 w-8"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(agent.status)}
            <Badge variant={getStatusColor(agent.status) as any} className="text-xs">
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${agent.whatsapp_connected ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <MessageSquare className="w-3 h-3" />
            </div>
            <div className={`p-1.5 rounded-md ${agent.calendar_connected ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <Calendar className="w-3 h-3" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{conversationCount} conversas</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Criado {new Date(agent.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure(agent)}
              className="text-xs"
            >
              Configurar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(agent.id, agent.status)}
              className={agent.status === 'active' ? 'border-destructive text-destructive hover:bg-destructive/10' : 'border-success text-success hover:bg-success/10'}
            >
              {agent.status === 'active' ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;