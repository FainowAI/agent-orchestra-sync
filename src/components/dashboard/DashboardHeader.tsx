import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Plus, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  onCreateAgent: () => void;
}

const DashboardHeader = ({ onCreateAgent }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg shadow-glow" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AgentSync</h1>
              <p className="text-sm text-muted-foreground">AI Agent Orchestration Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onCreateAgent}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-foreground">{user?.email}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;