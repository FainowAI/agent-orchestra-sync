export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          ai_prompt: string | null
          created_at: string
          id: number
        }
        Insert: {
          ai_prompt?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          ai_prompt?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      form_response: {
        Row: {
          created_at: string
          etapas_ia: Json | null
          id: number
          perfil_empresa: Json | null
          perfil_ia: Json | null
          tipo_ia: string | null
          treinamento_ia: Json | null
        }
        Insert: {
          created_at?: string
          etapas_ia?: Json | null
          id?: number
          perfil_empresa?: Json | null
          perfil_ia?: Json | null
          tipo_ia?: string | null
          treinamento_ia?: Json | null
        }
        Update: {
          created_at?: string
          etapas_ia?: Json | null
          id?: number
          perfil_empresa?: Json | null
          perfil_ia?: Json | null
          tipo_ia?: string | null
          treinamento_ia?: Json | null
        }
        Relationships: []
      }
      leadGenData: {
        Row: {
          cidade: string | null
          created_at: string
          email: string | null
          estado: string | null
          id: number
          instagram: string | null
          name: string | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: number
          instagram?: string | null
          name?: string | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          estado?: string | null
          id?: number
          instagram?: string | null
          name?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      orchestraForm: {
        Row: {
          created_at: string
          desejo: string | null
          email: string | null
          estetica: string | null
          finalidade: string | null
          id: number
          nome: string | null
          nomeAvatar: string | null
          nomeEmpresa: string | null
          objetivo: string | null
          qtdMaterial: number | null
          quemPreencheu: string | null
          repMarca: string | null
          socialMedia: string | null
          temReferencia: string | null
          termosCondicoes: string | null
          tom: string | null
        }
        Insert: {
          created_at?: string
          desejo?: string | null
          email?: string | null
          estetica?: string | null
          finalidade?: string | null
          id?: number
          nome?: string | null
          nomeAvatar?: string | null
          nomeEmpresa?: string | null
          objetivo?: string | null
          qtdMaterial?: number | null
          quemPreencheu?: string | null
          repMarca?: string | null
          socialMedia?: string | null
          temReferencia?: string | null
          termosCondicoes?: string | null
          tom?: string | null
        }
        Update: {
          created_at?: string
          desejo?: string | null
          email?: string | null
          estetica?: string | null
          finalidade?: string | null
          id?: number
          nome?: string | null
          nomeAvatar?: string | null
          nomeEmpresa?: string | null
          objetivo?: string | null
          qtdMaterial?: number | null
          quemPreencheu?: string | null
          repMarca?: string | null
          socialMedia?: string | null
          temReferencia?: string | null
          termosCondicoes?: string | null
          tom?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
