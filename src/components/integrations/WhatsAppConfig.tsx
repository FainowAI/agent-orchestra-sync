import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2, Check, AlertTriangle } from 'lucide-react';

interface WhatsAppConfigProps {
  agentId: string;
  connection?: {
    id: string;
    phone_number: string;
    status: string;
    webhook_url?: string;
  };
  onConnectionUpdate: () => void;
}

const WhatsAppConfig = ({ agentId, connection, onConnectionUpdate }: WhatsAppConfigProps) => {
  const [phoneNumber, setPhoneNumber] = useState(connection?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const createInstance = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um número de telefone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-whatsapp-instance', {
        body: { 
          agentId,
          phoneNumber: phoneNumber.trim()
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Instância Criada",
          description: "WhatsApp instância criada! Escaneie o QR Code para conectar.",
        });
        
        // Display QR code if available
        if (data.qrcode || data.qr) {
          console.log('QR Code available for scanning');
          // The QR code will be handled by the Evolution API interface
        }
        
        onConnectionUpdate();
      } else {
        throw new Error(data?.error || 'Falha ao criar instância');
      }
    } catch (error: any) {
      console.error('Error creating WhatsApp instance:', error);
      toast({
        title: "Erro ao criar instância",
        description: error.message || "Falha ao conectar com Evolution API. Verifique se o campo 'integration' está correto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!connection?.id) return;

    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke('test-whatsapp-connection', {
        body: { connectionId: connection.id }
      });

      if (error) throw error;

      toast({
        title: "Conexão Testada",
        description: "WhatsApp está funcionando corretamente!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message || "Falha ao testar conexão",
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
      default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-success" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">WhatsApp Evolution</CardTitle>
            <CardDescription className="text-muted-foreground">
              Conecte seu agente ao WhatsApp via Evolution API
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
                    {connection.phone_number}
                  </p>
                  <p className={`text-xs ${getStatusColor(connection.status)}`}>
                    Status: {connection.status}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={testing}
              >
                {testing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Testar Conexão
              </Button>
            </div>

            {connection.webhook_url && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                <p className="text-sm text-foreground font-mono break-all">
                  {connection.webhook_url}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Número do WhatsApp
              </Label>
              <Input
                id="phone"
                placeholder="Ex: 5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground">
                Digite o número com código do país (sem + ou espaços)
              </p>
            </div>

            <Button
              onClick={createInstance}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Instância WhatsApp
            </Button>
          </div>
        )}

        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
            <div className="text-xs text-warning">
              <p className="font-medium">Importante:</p>
              <p>Certifique-se de que sua Evolution API está configurada e acessível.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfig;