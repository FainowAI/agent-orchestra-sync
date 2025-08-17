-- Create tables for AI agent orchestration platform

-- Agents table
CREATE TABLE public.agents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    whatsapp_connected BOOLEAN NOT NULL DEFAULT false,
    calendar_connected BOOLEAN NOT NULL DEFAULT false,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhatsApp connections table
CREATE TABLE public.whatsapp_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    webhook_url TEXT,
    api_key TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Google Calendar connections table
CREATE TABLE public.calendar_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent conversations table
CREATE TABLE public.agent_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'calendar')),
    last_message TEXT,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Users can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for WhatsApp connections
CREATE POLICY "Users can view their agent connections" 
ON public.whatsapp_connections 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = whatsapp_connections.agent_id 
    AND agents.user_id = auth.uid()
));

CREATE POLICY "Users can manage their agent connections" 
ON public.whatsapp_connections 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = whatsapp_connections.agent_id 
    AND agents.user_id = auth.uid()
));

-- RLS Policies for Calendar connections
CREATE POLICY "Users can view their calendar connections" 
ON public.calendar_connections 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = calendar_connections.agent_id 
    AND agents.user_id = auth.uid()
));

CREATE POLICY "Users can manage their calendar connections" 
ON public.calendar_connections 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = calendar_connections.agent_id 
    AND agents.user_id = auth.uid()
));

-- RLS Policies for conversations
CREATE POLICY "Users can view their agent conversations" 
ON public.agent_conversations 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_conversations.agent_id 
    AND agents.user_id = auth.uid()
));

CREATE POLICY "Users can manage their agent conversations" 
ON public.agent_conversations 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_conversations.agent_id 
    AND agents.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_connections_updated_at
    BEFORE UPDATE ON public.whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_connections_updated_at
    BEFORE UPDATE ON public.calendar_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
    BEFORE UPDATE ON public.agent_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();