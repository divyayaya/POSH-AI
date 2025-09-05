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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      case_assignments: {
        Row: {
          assigned_by: string
          assignee_id: string
          assignee_role: string
          assignment_date: string
          case_id: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
        }
        Insert: {
          assigned_by: string
          assignee_id: string
          assignee_role: string
          assignment_date?: string
          case_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          assigned_by?: string
          assignee_id?: string
          assignee_role?: string
          assignment_date?: string
          case_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_reviews: {
        Row: {
          case_id: string
          created_at: string
          credibility_assessment: number
          id: string
          investigation_pathway: string
          metadata: Json | null
          rationale: string
          review_type: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          credibility_assessment: number
          id?: string
          investigation_pathway: string
          metadata?: Json | null
          rationale: string
          review_type?: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          credibility_assessment?: number
          id?: string
          investigation_pathway?: string
          metadata?: Json | null
          rationale?: string
          review_type?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_reviews_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          ai_analysis: Json | null
          assigned_date: string | null
          assigned_to: string | null
          case_number: string
          complainant_name: string
          created_at: string
          description: string
          evidence_score: number
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["case_priority"]
          resolution_date: string | null
          resolution_notes: string | null
          respondent_name: string
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          assigned_date?: string | null
          assigned_to?: string | null
          case_number: string
          complainant_name: string
          created_at?: string
          description: string
          evidence_score?: number
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["case_priority"]
          resolution_date?: string | null
          resolution_notes?: string | null
          respondent_name: string
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          assigned_date?: string | null
          assigned_to?: string | null
          case_number?: string
          complainant_name?: string
          created_at?: string
          description?: string
          evidence_score?: number
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["case_priority"]
          resolution_date?: string | null
          resolution_notes?: string | null
          respondent_name?: string
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_deadlines: {
        Row: {
          alert_sent_date: string | null
          case_id: string
          created_at: string
          deadline_date: string
          deadline_type: string
          description: string
          id: string
          status: string
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          alert_sent_date?: string | null
          case_id: string
          created_at?: string
          deadline_date: string
          deadline_type: string
          description: string
          id?: string
          status?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          alert_sent_date?: string | null
          case_id?: string
          created_at?: string
          deadline_date?: string
          deadline_type?: string
          description?: string
          id?: string
          status?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          ai_analysis: Json | null
          case_id: string
          created_at: string
          description: string
          file_url: string | null
          id: string
          metadata: Json | null
          score: number
          type: Database["public"]["Enums"]["evidence_type"]
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          case_id: string
          created_at?: string
          description: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          score?: number
          type: Database["public"]["Enums"]["evidence_type"]
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          case_id?: string
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          score?: number
          type?: Database["public"]["Enums"]["evidence_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id: string
          is_active?: boolean
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          case_id: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          payload: Json
          response: Json | null
          status: string
          webhook_type: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          payload: Json
          response?: Json | null
          status: string
          webhook_type: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          payload?: Json
          response?: Json | null
          status?: string
          webhook_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_hr_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_icc_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_investigator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      case_priority: "low" | "medium" | "high" | "critical"
      case_status:
        | "pending"
        | "under_review"
        | "investigating"
        | "mediation"
        | "closed"
        | "escalated"
      evidence_type:
        | "witness_statement"
        | "document"
        | "physical_evidence"
        | "digital_evidence"
        | "email"
        | "chat_log"
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
    Enums: {
      case_priority: ["low", "medium", "high", "critical"],
      case_status: [
        "pending",
        "under_review",
        "investigating",
        "mediation",
        "closed",
        "escalated",
      ],
      evidence_type: [
        "witness_statement",
        "document",
        "physical_evidence",
        "digital_evidence",
        "email",
        "chat_log",
      ],
    },
  },
} as const
