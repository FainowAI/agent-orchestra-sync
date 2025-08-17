import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Loader2, Settings, Zap } from 'lucide-react';

interface OpenAIConfigProps {
  agentId: string;
  configuration?: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  };
  onConfigUpdate: () => void;
}

const OpenAIConfig = ({ agentId, configuration, onConfigUpdate }: OpenAIConfigProps) => {
  const [model, setModel] = useState(configuration?.model || 'gpt-4o-mini');
  const [systemPrompt, setSystemPrompt] = useState(configuration?.systemPrompt || '');
  const [temperature, setTemperature] = useState(configuration?.temperature?.toString() || '0.7');
  const [maxTokens, setMaxTokens] = useState(configuration?.maxTokens?.toString() || '1000');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const models = [
    { value: 'gpt-4o', label: 'GPT-4o (Mais Avançado)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recomendado)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Econômico)' },
  ];

  const defaultPrompts = {
    customer_service: `Você é um assistente virtual especializado em atendimento ao cliente. Seja sempre educado, prestativo e profissional. Responda de forma clara e objetiva, sempre tentando resolver os problemas dos clientes da melhor maneira possível.`,
    scheduling: `Você é um assistente de agendamento inteligente. Sua função é ajudar os usuários a marcar, reagendar ou cancelar compromissos. Sempre confirme os detalhes antes de finalizar qualquer agendamento e seja flexível com as necessidades do cliente.`,
    sales: `Você é um assistente de vendas experiente. Seu objetivo é ajudar os clientes a encontrar os produtos ou serviços que melhor atendem suas necessidades. Seja consultivo, faça perguntas relevantes e apresente soluções de valor.`,
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const config = {
        model,
        systemPrompt,
        temperature: parseFloat(temperature),
        maxTokens: parseInt(maxTokens),
      };

      const { error } = await supabase
        .from('agents')
        .update({ 
          configuration: config
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Configuração Salva",
        description: "As configurações do OpenAI foram atualizadas com sucesso!",
      });

      onConfigUpdate();
    } catch (error: any) {
      console.error('Error saving OpenAI config:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Falha ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testModel = async () => {
    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke('test-openai-model', {
        body: { 
          model,
          systemPrompt,
          temperature: parseFloat(temperature),
          maxTokens: parseInt(maxTokens),
          testMessage: "Olá, este é um teste de funcionamento do modelo."
        }
      });

      if (error) throw error;

      toast({
        title: "Modelo Testado",
        description: "O modelo OpenAI está funcionando corretamente!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao testar modelo",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">OpenAI Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure o modelo de IA e comportamento do seu agente
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model" className="text-foreground">Modelo OpenAI</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-foreground">Temperatura</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens" className="text-foreground">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            min="100"
            max="4000"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="systemPrompt" className="text-foreground">System Prompt</Label>
            <Select onValueChange={(value) => setSystemPrompt(defaultPrompts[value as keyof typeof defaultPrompts])}>
              <SelectTrigger className="w-40 bg-muted border-border">
                <SelectValue placeholder="Modelos prontos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_service">Atendimento</SelectItem>
                <SelectItem value="scheduling">Agendamento</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            id="systemPrompt"
            placeholder="Descreva como o agente deve se comportar..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="bg-muted border-border resize-none"
            rows={4}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={testModel}
            variant="outline"
            disabled={testing || !systemPrompt.trim()}
            className="flex-1"
          >
            {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Zap className="w-4 h-4 mr-2" />
            Testar Modelo
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={loading || !systemPrompt.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground">Modelo</p>
            <p className="text-sm font-medium text-foreground">{model}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground">Temp</p>
            <p className="text-sm font-medium text-foreground">{temperature}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground">Tokens</p>
            <p className="text-sm font-medium text-foreground">{maxTokens}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenAIConfig;