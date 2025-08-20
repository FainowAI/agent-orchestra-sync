import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, Calendar, Activity } from 'lucide-react';

interface DashboardStatsProps {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  connectedServices: number;
}

const DashboardStats = ({ totalAgents, activeAgents, totalConversations, connectedServices }: DashboardStatsProps) => {
  const stats = [
    {
      title: 'Total Agents',
      value: totalAgents,
      icon: Bot,
      description: `${activeAgents} active`,
      color: 'text-primary'
    },
    {
      title: 'Conversations',
      value: totalConversations,
      icon: MessageSquare,
      description: 'Total interactions',
      color: 'text-success'
    },
    {
      title: 'Connected Services',
      value: connectedServices,
      icon: Activity,
      description: 'WhatsApp & Calendar',
      color: 'text-secondary'
    },
    {
      title: 'Active Integrations',
      value: connectedServices,
      icon: Calendar,
      description: 'Running connections',
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;