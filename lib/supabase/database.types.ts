export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      farms: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      fields: {
        Row: {
          id: string
          farm_id: string
          name: string
          area: number | null
          area_unit: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          name: string
          area?: number | null
          area_unit?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          name?: string
          area?: number | null
          area_unit?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_farm_id_fkey"
            columns: ["farm_id"]
            referencedRelation: "farms"
            referencedColumns: ["id"]
          }
        ]
      }
      forms: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          form_schema: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          form_schema?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          form_schema?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      form_submissions: {
        Row: {
          id: string
          owner_id: string
          form_id: string | null
          farm_id: string | null
          field_id: string | null
          client_submission_id: string | null
          form_schema_snapshot: Json
          responses: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          form_id?: string | null
          farm_id?: string | null
          field_id?: string | null
          client_submission_id?: string | null
          form_schema_snapshot?: Json
          responses?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          form_id?: string | null
          farm_id?: string | null
          field_id?: string | null
          client_submission_id?: string | null
          form_schema_snapshot?: Json
          responses?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_farm_id_fkey"
            columns: ["farm_id"]
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_field_id_fkey"
            columns: ["field_id"]
            referencedRelation: "fields"
            referencedColumns: ["id"]
          }
        ]
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
