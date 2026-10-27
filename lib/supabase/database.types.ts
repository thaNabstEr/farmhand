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
      farmers: {
        Row: {
          id: string
          owner_id: string
          first_name: string
          last_name: string
          phone: string | null
          email: string | null
          national_id: string | null
          community: string | null
          village: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          first_name: string
          last_name: string
          phone?: string | null
          email?: string | null
          national_id?: string | null
          community?: string | null
          village?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          email?: string | null
          national_id?: string | null
          community?: string | null
          village?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmers_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      farms: {
        Row: {
          id: string
          owner_id: string
          farmer_id: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          farmer_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          farmer_id?: string | null
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
          },
          {
            foreignKeyName: "farms_farmer_id_fkey"
            columns: ["farmer_id"]
            referencedRelation: "farmers"
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
      projects: {
        Row: {
          id: string
          owner_id: string
          name: string
          code: string | null
          description: string | null
          status: string
          target_submissions: number | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          code?: string | null
          description?: string | null
          status?: string
          target_submissions?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          code?: string | null
          description?: string | null
          status?: string
          target_submissions?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_forms: {
        Row: {
          id: string
          project_id: string
          form_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          form_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          form_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_forms_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_forms_form_id_fkey"
            columns: ["form_id"]
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
      form_submissions: {
        Row: {
          id: string
          owner_id: string
          form_id: string | null
          farmer_id: string | null
          farm_id: string | null
          field_id: string | null
          project_id: string | null
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
          farmer_id?: string | null
          farm_id?: string | null
          field_id?: string | null
          project_id?: string | null
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
          farmer_id?: string | null
          farm_id?: string | null
          field_id?: string | null
          project_id?: string | null
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
            foreignKeyName: "form_submissions_farmer_id_fkey"
            columns: ["farmer_id"]
            referencedRelation: "farmers"
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
          },
          {
            foreignKeyName: "form_submissions_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
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
