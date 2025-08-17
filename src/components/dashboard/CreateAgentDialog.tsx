import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Bot, MessageSquare, Calendar } from 'lucide-react';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: () => void;
}

const CreateAgentDialog = ({ open, onOpenChange, onAgentCreated }: CreateAgentDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .insert({
          name,
          description,
          user_id: user.id,
          status: 'inactive'
        });

      if (error) throw error;

      toast({
        title: "Agent Created",
        description: `${name} has been successfully created`,
      });

      setName('');
      setDescription('');
      onOpenChange(false);
      onAgentCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">Create AI Agent</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Set up a new AI agent for WhatsApp and Calendar automation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Support Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this agent will do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted border-border resize-none"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
              <span>What you can connect after creation:</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>WhatsApp (AvisaAPI)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>Google Calendar</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentDialog;