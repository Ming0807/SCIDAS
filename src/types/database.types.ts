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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_scores: {
        Row: {
          classroom_subject_id: string
          classwork_score: number | null
          created_at: string
          final_score: number | null
          grade: string | null
          grade_point: number | null
          id: string
          midterm_score: number | null
          remark: string | null
          school_id: string
          semester_id: string
          student_id: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          classroom_subject_id: string
          classwork_score?: number | null
          created_at?: string
          final_score?: number | null
          grade?: string | null
          grade_point?: number | null
          id?: string
          midterm_score?: number | null
          remark?: string | null
          school_id?: string
          semester_id: string
          student_id: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          classroom_subject_id?: string
          classwork_score?: number | null
          created_at?: string
          final_score?: number | null
          grade?: string | null
          grade_point?: number | null
          id?: string
          midterm_score?: number | null
          remark?: string | null
          school_id?: string
          semester_id?: string
          student_id?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_scores_classroom_subject_id_fkey"
            columns: ["classroom_subject_id"]
            isOneToOne: false
            referencedRelation: "classroom_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_scores_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_scores_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          school_id: string
          start_date: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          school_id: string
          start_date: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          school_id?: string
          start_date?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assigned_by: string
          assigned_date: string
          assignment_description: string | null
          assignment_title: string
          classroom_subject_id: string
          created_at: string
          due_date: string
          feedback: string | null
          id: string
          max_score: number | null
          school_id: string
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_date: string
          assignment_description?: string | null
          assignment_title: string
          classroom_subject_id: string
          created_at?: string
          due_date: string
          feedback?: string | null
          id?: string
          max_score?: number | null
          school_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_date?: string
          assignment_description?: string | null
          assignment_title?: string
          classroom_subject_id?: string
          created_at?: string
          due_date?: string
          feedback?: string | null
          id?: string
          max_score?: number | null
          school_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submitted_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_classroom_subject_id_fkey"
            columns: ["classroom_subject_id"]
            isOneToOne: false
            referencedRelation: "classroom_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          check_in_time: string | null
          classroom_id: string
          created_at: string
          date: string
          id: string
          recorded_by: string
          remark: string | null
          school_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          classroom_id: string
          created_at?: string
          date: string
          id?: string
          recorded_by: string
          remark?: string | null
          school_id?: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          classroom_id?: string
          created_at?: string
          date?: string
          id?: string
          recorded_by?: string
          remark?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          school_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          school_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          school_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      basic_skills: {
        Row: {
          assessed_at: string
          assessed_by: string
          created_at: string
          id: string
          math_level: Database["public"]["Enums"]["skill_level"]
          math_note: string | null
          math_score: number | null
          reading_level: Database["public"]["Enums"]["skill_level"]
          reading_note: string | null
          reading_score: number | null
          remark: string | null
          school_id: string
          semester_id: string
          student_id: string
          updated_at: string
          writing_level: Database["public"]["Enums"]["skill_level"]
          writing_note: string | null
          writing_score: number | null
        }
        Insert: {
          assessed_at?: string
          assessed_by: string
          created_at?: string
          id?: string
          math_level: Database["public"]["Enums"]["skill_level"]
          math_note?: string | null
          math_score?: number | null
          reading_level: Database["public"]["Enums"]["skill_level"]
          reading_note?: string | null
          reading_score?: number | null
          remark?: string | null
          school_id?: string
          semester_id: string
          student_id: string
          updated_at?: string
          writing_level: Database["public"]["Enums"]["skill_level"]
          writing_note?: string | null
          writing_score?: number | null
        }
        Update: {
          assessed_at?: string
          assessed_by?: string
          created_at?: string
          id?: string
          math_level?: Database["public"]["Enums"]["skill_level"]
          math_note?: string | null
          math_score?: number | null
          reading_level?: Database["public"]["Enums"]["skill_level"]
          reading_note?: string | null
          reading_score?: number | null
          remark?: string | null
          school_id?: string
          semester_id?: string
          student_id?: string
          updated_at?: string
          writing_level?: Database["public"]["Enums"]["skill_level"]
          writing_note?: string | null
          writing_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "basic_skills_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basic_skills_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basic_skills_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basic_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_records: {
        Row: {
          action_taken: string | null
          behavior_type: Database["public"]["Enums"]["behavior_type"]
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          parent_notified: boolean | null
          points: number | null
          reported_by: string
          school_id: string
          severity: Database["public"]["Enums"]["severity_level"] | null
          student_id: string
          updated_at: string
          witness: string | null
        }
        Insert: {
          action_taken?: string | null
          behavior_type: Database["public"]["Enums"]["behavior_type"]
          category?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          parent_notified?: boolean | null
          points?: number | null
          reported_by: string
          school_id?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          student_id: string
          updated_at?: string
          witness?: string | null
        }
        Update: {
          action_taken?: string | null
          behavior_type?: Database["public"]["Enums"]["behavior_type"]
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          parent_notified?: boolean | null
          points?: number | null
          reported_by?: string
          school_id?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          student_id?: string
          updated_at?: string
          witness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_records_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_students: {
        Row: {
          classroom_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          school_id: string
          semester_id: string
          student_id: string
          student_number: number | null
        }
        Insert: {
          classroom_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          school_id?: string
          semester_id: string
          student_id: string
          student_number?: number | null
        }
        Update: {
          classroom_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          school_id?: string
          semester_id?: string
          student_id?: string
          student_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_subjects: {
        Row: {
          classroom_id: string
          classwork_max_score: number | null
          created_at: string
          final_max_score: number | null
          id: string
          midterm_max_score: number | null
          school_id: string
          semester_id: string
          subject_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          classwork_max_score?: number | null
          created_at?: string
          final_max_score?: number | null
          id?: string
          midterm_max_score?: number | null
          school_id?: string
          semester_id: string
          subject_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          classwork_max_score?: number | null
          created_at?: string
          final_max_score?: number | null
          id?: string
          midterm_max_score?: number | null
          school_id?: string
          semester_id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_subjects_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          academic_year_id: string
          co_teacher_id: string | null
          created_at: string
          grade_level: Database["public"]["Enums"]["grade_level"]
          homeroom_teacher_id: string | null
          id: string
          is_active: boolean
          max_students: number | null
          name: string
          room_number: string | null
          school_id: string
          section: number
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          co_teacher_id?: string | null
          created_at?: string
          grade_level: Database["public"]["Enums"]["grade_level"]
          homeroom_teacher_id?: string | null
          id?: string
          is_active?: boolean
          max_students?: number | null
          name: string
          room_number?: string | null
          school_id: string
          section?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          co_teacher_id?: string | null
          created_at?: string
          grade_level?: Database["public"]["Enums"]["grade_level"]
          homeroom_teacher_id?: string | null
          id?: string
          is_active?: boolean
          max_students?: number | null
          name?: string
          room_number?: string | null
          school_id?: string
          section?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_co_teacher_id_fkey"
            columns: ["co_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_homeroom_teacher_id_fkey"
            columns: ["homeroom_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      development_activities: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          display_order: number | null
          end_date: string | null
          goal_id: string
          id: string
          is_completed: boolean
          responsible_person: string | null
          result: string | null
          school_id: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean
          responsible_person?: string | null
          result?: string | null
          school_id?: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean
          responsible_person?: string | null
          result?: string | null
          school_id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_activities_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "development_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_activities_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      development_evaluations: {
        Row: {
          areas_for_improvement: string | null
          continue_plan: boolean | null
          created_at: string
          evaluated_by: string
          evaluation_date: string
          evaluation_round: number
          id: string
          overall_result: string
          parent_feedback: string | null
          plan_id: string
          recommendations: string | null
          school_id: string
          strengths: string | null
          student_feedback: string | null
          updated_at: string
        }
        Insert: {
          areas_for_improvement?: string | null
          continue_plan?: boolean | null
          created_at?: string
          evaluated_by: string
          evaluation_date: string
          evaluation_round: number
          id?: string
          overall_result: string
          parent_feedback?: string | null
          plan_id: string
          recommendations?: string | null
          school_id?: string
          strengths?: string | null
          student_feedback?: string | null
          updated_at?: string
        }
        Update: {
          areas_for_improvement?: string | null
          continue_plan?: boolean | null
          created_at?: string
          evaluated_by?: string
          evaluation_date?: string
          evaluation_round?: number
          id?: string
          overall_result?: string
          parent_feedback?: string | null
          plan_id?: string
          recommendations?: string | null
          school_id?: string
          strengths?: string | null
          student_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_evaluations_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_evaluations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "development_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_evaluations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      development_goals: {
        Row: {
          achieved_at: string | null
          category: string | null
          created_at: string
          current_value: string | null
          description: string | null
          goal_number: number
          id: string
          plan_id: string
          progress: number | null
          school_id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          target_value: string | null
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          category?: string | null
          created_at?: string
          current_value?: string | null
          description?: string | null
          goal_number: number
          id?: string
          plan_id: string
          progress?: number | null
          school_id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          category?: string | null
          created_at?: string
          current_value?: string | null
          description?: string | null
          goal_number?: number
          id?: string
          plan_id?: string
          progress?: number | null
          school_id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_goals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "development_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_goals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      development_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          focus_areas: string[] | null
          id: string
          overall_progress: number | null
          risk_assessment_id: string | null
          school_id: string
          semester_id: string
          start_date: string
          status: Database["public"]["Enums"]["plan_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          focus_areas?: string[] | null
          id?: string
          overall_progress?: number | null
          risk_assessment_id?: string | null
          school_id?: string
          semester_id: string
          start_date: string
          status?: Database["public"]["Enums"]["plan_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          focus_areas?: string[] | null
          id?: string
          overall_progress?: number | null
          risk_assessment_id?: string | null
          school_id?: string
          semester_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["plan_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_plans_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_plans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_plans_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name: string
          monthly_income: number | null
          national_id: string | null
          occupation: string | null
          phone: string | null
          phone_secondary: string | null
          prefix: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name: string
          monthly_income?: number | null
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          phone_secondary?: string | null
          prefix?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name?: string
          monthly_income?: number | null
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          phone_secondary?: string | null
          prefix?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      home_visit_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          home_visit_id: string
          id: string
          image_url: string
          school_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          home_visit_id: string
          id?: string
          image_url: string
          school_id?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          home_visit_id?: string
          id?: string
          image_url?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_visit_images_home_visit_id_fkey"
            columns: ["home_visit_id"]
            isOneToOne: false
            referencedRelation: "home_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_visit_images_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      home_visits: {
        Row: {
          address_visited: string | null
          co_visitors: string[] | null
          created_at: string
          environment_safety: string | null
          family_income: number | null
          family_members_count: number | null
          family_problem_detail: string | null
          family_situation: string | null
          follow_up_detail: string | null
          follow_up_needed: boolean | null
          guardian_met_id: string | null
          has_family_problem: boolean | null
          has_internet: boolean | null
          has_study_space: boolean | null
          housing_condition:
            | Database["public"]["Enums"]["housing_condition"]
            | null
          housing_ownership: string | null
          housing_type: string | null
          id: string
          latitude: number | null
          longitude: number | null
          overall_assessment: string | null
          school_id: string
          semester_id: string
          student_behavior_at_home: string | null
          student_id: string
          suggestions: string | null
          travel_difficulty: boolean | null
          travel_difficulty_detail: string | null
          updated_at: string
          visit_date: string
          visit_time: string | null
          visitor_id: string
        }
        Insert: {
          address_visited?: string | null
          co_visitors?: string[] | null
          created_at?: string
          environment_safety?: string | null
          family_income?: number | null
          family_members_count?: number | null
          family_problem_detail?: string | null
          family_situation?: string | null
          follow_up_detail?: string | null
          follow_up_needed?: boolean | null
          guardian_met_id?: string | null
          has_family_problem?: boolean | null
          has_internet?: boolean | null
          has_study_space?: boolean | null
          housing_condition?:
            | Database["public"]["Enums"]["housing_condition"]
            | null
          housing_ownership?: string | null
          housing_type?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          overall_assessment?: string | null
          school_id?: string
          semester_id: string
          student_behavior_at_home?: string | null
          student_id: string
          suggestions?: string | null
          travel_difficulty?: boolean | null
          travel_difficulty_detail?: string | null
          updated_at?: string
          visit_date: string
          visit_time?: string | null
          visitor_id: string
        }
        Update: {
          address_visited?: string | null
          co_visitors?: string[] | null
          created_at?: string
          environment_safety?: string | null
          family_income?: number | null
          family_members_count?: number | null
          family_problem_detail?: string | null
          family_situation?: string | null
          follow_up_detail?: string | null
          follow_up_needed?: boolean | null
          guardian_met_id?: string | null
          has_family_problem?: boolean | null
          has_internet?: boolean | null
          has_study_space?: boolean | null
          housing_condition?:
            | Database["public"]["Enums"]["housing_condition"]
            | null
          housing_ownership?: string | null
          housing_type?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          overall_assessment?: string | null
          school_id?: string
          semester_id?: string
          student_behavior_at_home?: string | null
          student_id?: string
          suggestions?: string | null
          travel_difficulty?: boolean | null
          travel_difficulty_detail?: string | null
          updated_at?: string
          visit_date?: string
          visit_time?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_visits_guardian_met_id_fkey"
            columns: ["guardian_met_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_visits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_visits_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_visits_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          read_at: string | null
          recipient_id: string
          reference_id: string | null
          reference_type: string | null
          school_id: string
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          read_at?: string | null
          recipient_id: string
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string
          sender_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          read_at?: string | null
          recipient_id?: string
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          employee_id: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string
          nickname: string | null
          phone: string | null
          position: string | null
          prefix: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          last_name: string
          nickname?: string | null
          phone?: string | null
          position?: string | null
          prefix?: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string
          nickname?: string | null
          phone?: string | null
          position?: string | null
          prefix?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessed_at: string
          assessed_by: string
          auto_calculated: boolean | null
          created_at: string
          id: string
          manual_override: boolean | null
          override_reason: string | null
          previous_risk_level: Database["public"]["Enums"]["risk_level"] | null
          recommendations: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          school_id: string
          semester_id: string
          student_id: string
          summary: string | null
          trend: string | null
          updated_at: string
        }
        Insert: {
          assessed_at?: string
          assessed_by: string
          auto_calculated?: boolean | null
          created_at?: string
          id?: string
          manual_override?: boolean | null
          override_reason?: string | null
          previous_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          recommendations?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          school_id?: string
          semester_id: string
          student_id: string
          summary?: string | null
          trend?: string | null
          updated_at?: string
        }
        Update: {
          assessed_at?: string
          assessed_by?: string
          auto_calculated?: boolean | null
          created_at?: string
          id?: string
          manual_override?: boolean | null
          override_reason?: string | null
          previous_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          recommendations?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
          school_id?: string
          semester_id?: string
          student_id?: string
          summary?: string | null
          trend?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_factors: {
        Row: {
          created_at: string
          data_source: string | null
          evidence: string | null
          factor_key: string
          factor_label: string
          id: string
          is_active: boolean
          risk_assessment_id: string
          school_id: string
          score: number
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          evidence?: string | null
          factor_key: string
          factor_label: string
          id?: string
          is_active?: boolean
          risk_assessment_id: string
          school_id?: string
          score: number
        }
        Update: {
          created_at?: string
          data_source?: string | null
          evidence?: string | null
          factor_key?: string
          factor_label?: string
          id?: string
          is_active?: boolean
          risk_assessment_id?: string
          school_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_factors_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_factors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          director_name: string | null
          district: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          name_en: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          school_code: string
          school_size: string | null
          subdistrict: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          director_name?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          school_code: string
          school_size?: string | null
          subdistrict?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          director_name?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          school_code?: string
          school_size?: string | null
          subdistrict?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      semesters: {
        Row: {
          academic_year_id: string
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          school_id: string
          semester: Database["public"]["Enums"]["semester_type"]
          start_date: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          school_id?: string
          semester: Database["public"]["Enums"]["semester_type"]
          start_date: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          school_id?: string
          semester?: Database["public"]["Enums"]["semester_type"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semesters_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semesters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          can_pickup: boolean
          created_at: string
          guardian_id: string
          id: string
          is_emergency_contact: boolean
          is_primary: boolean
          relation: Database["public"]["Enums"]["guardian_relation"]
          school_id: string
          student_id: string
        }
        Insert: {
          can_pickup?: boolean
          created_at?: string
          guardian_id: string
          id?: string
          is_emergency_contact?: boolean
          is_primary?: boolean
          relation: Database["public"]["Enums"]["guardian_relation"]
          school_id?: string
          student_id: string
        }
        Update: {
          can_pickup?: boolean
          created_at?: string
          guardian_id?: string
          id?: string
          is_emergency_contact?: boolean
          is_primary?: boolean
          relation?: Database["public"]["Enums"]["guardian_relation"]
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string
          distance_to_school_km: number | null
          district: string | null
          enrollment_date: string | null
          ethnicity: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          graduation_date: string | null
          id: string
          last_name: string
          latitude: number | null
          longitude: number | null
          medical_conditions: string | null
          national_id: string | null
          nationality: string | null
          nickname: string | null
          photo_url: string | null
          postal_code: string | null
          prefix: string | null
          previous_school: string | null
          province: string | null
          religion: string | null
          school_id: string
          special_needs: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_code: string
          subdistrict: string | null
          travel_method: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth: string
          distance_to_school_km?: number | null
          district?: string | null
          enrollment_date?: string | null
          ethnicity?: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          graduation_date?: string | null
          id?: string
          last_name: string
          latitude?: number | null
          longitude?: number | null
          medical_conditions?: string | null
          national_id?: string | null
          nationality?: string | null
          nickname?: string | null
          photo_url?: string | null
          postal_code?: string | null
          prefix?: string | null
          previous_school?: string | null
          province?: string | null
          religion?: string | null
          school_id: string
          special_needs?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_code: string
          subdistrict?: string | null
          travel_method?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string
          distance_to_school_km?: number | null
          district?: string | null
          enrollment_date?: string | null
          ethnicity?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          graduation_date?: string | null
          id?: string
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          medical_conditions?: string | null
          national_id?: string | null
          nationality?: string | null
          nickname?: string | null
          photo_url?: string | null
          postal_code?: string | null
          prefix?: string | null
          previous_school?: string | null
          province?: string | null
          religion?: string | null
          school_id?: string
          special_needs?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_code?: string
          subdistrict?: string | null
          travel_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          credit: number | null
          description: string | null
          grade_level: Database["public"]["Enums"]["grade_level"] | null
          hours_per_week: number | null
          id: string
          is_active: boolean
          learning_area: string | null
          name: string
          name_en: string | null
          school_id: string
          subject_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit?: number | null
          description?: string | null
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          hours_per_week?: number | null
          id?: string
          is_active?: boolean
          learning_area?: string | null
          name: string
          name_en?: string | null
          school_id: string
          subject_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit?: number | null
          description?: string | null
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          hours_per_week?: number | null
          id?: string
          is_active?: boolean
          learning_area?: string | null
          name?: string
          name_en?: string | null
          school_id?: string
          subject_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      support_followups: {
        Row: {
          created_at: string
          description: string
          followed_by: string
          followup_date: string
          id: string
          improvement_noted: boolean | null
          next_action: string | null
          next_followup_date: string | null
          result: string | null
          school_id: string
          support_record_id: string
        }
        Insert: {
          created_at?: string
          description: string
          followed_by: string
          followup_date: string
          id?: string
          improvement_noted?: boolean | null
          next_action?: string | null
          next_followup_date?: string | null
          result?: string | null
          school_id?: string
          support_record_id: string
        }
        Update: {
          created_at?: string
          description?: string
          followed_by?: string
          followup_date?: string
          id?: string
          improvement_noted?: boolean | null
          next_action?: string | null
          next_followup_date?: string | null
          result?: string | null
          school_id?: string
          support_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_followups_followed_by_fkey"
            columns: ["followed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_followups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_followups_support_record_id_fkey"
            columns: ["support_record_id"]
            isOneToOne: false
            referencedRelation: "support_records"
            referencedColumns: ["id"]
          },
        ]
      }
      support_records: {
        Row: {
          action_plan: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          description: string
          external_referral: string | null
          id: string
          priority: Database["public"]["Enums"]["severity_level"] | null
          provided_by: string
          provided_support: string | null
          resources_used: string | null
          school_id: string
          semester_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["support_status"]
          student_id: string
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at: string
        }
        Insert: {
          action_plan?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          external_referral?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["severity_level"] | null
          provided_by: string
          provided_support?: string | null
          resources_used?: string | null
          school_id?: string
          semester_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          student_id: string
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at?: string
        }
        Update: {
          action_plan?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          external_referral?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["severity_level"] | null
          provided_by?: string
          provided_support?: string | null
          resources_used?: string | null
          school_id?: string
          semester_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          student_id?: string
          support_type?: Database["public"]["Enums"]["support_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_records_provided_by_fkey"
            columns: ["provided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_records_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          school_id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          school_id: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          school_id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_calculate_risk_scores: {
        Args: { p_school_id: string; p_semester_id: string }
        Returns: {
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          student_id: string
          student_name: string
        }[]
      }
      calculate_risk_score: {
        Args: { p_semester_id: string; p_student_id: string }
        Returns: {
          calculated_level: Database["public"]["Enums"]["risk_level"]
          factors: Json
          total_score: number
        }[]
      }
      can_access_student: { Args: { p_student_id: string }; Returns: boolean }
      get_dashboard_summary: {
        Args: { p_school_id: string; p_semester_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_school_id: { Args: never; Returns: string }
      is_homeroom_teacher_of_student: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      is_subject_teacher_of_student: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      notify_risk_alert: {
        Args: { p_assessment_id: string; p_student_id: string }
        Returns: undefined
      }
      upsert_risk_assessment: {
        Args: {
          p_assessed_by?: string
          p_semester_id: string
          p_student_id: string
        }
        Returns: string
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "leave" | "sick"
      audit_action:
        | "INSERT"
        | "UPDATE"
        | "DELETE"
        | "LOGIN"
        | "LOGOUT"
        | "EXPORT"
        | "IMPORT"
      behavior_type: "positive" | "negative" | "neutral"
      gender_type: "male" | "female" | "other"
      goal_status:
        | "not_started"
        | "in_progress"
        | "achieved"
        | "not_achieved"
        | "cancelled"
      grade_level:
        | "p1"
        | "p2"
        | "p3"
        | "p4"
        | "p5"
        | "p6"
        | "m1"
        | "m2"
        | "m3"
        | "m4"
        | "m5"
        | "m6"
      guardian_relation:
        | "father"
        | "mother"
        | "grandfather"
        | "grandmother"
        | "uncle"
        | "aunt"
        | "sibling"
        | "other_relative"
        | "guardian"
      housing_condition: "good" | "moderate" | "poor" | "critical"
      notification_type:
        | "risk_alert"
        | "attendance_alert"
        | "assignment_alert"
        | "behavior_alert"
        | "home_visit_reminder"
        | "plan_review"
        | "system"
        | "general"
      plan_status: "draft" | "active" | "completed" | "cancelled"
      risk_level: "normal" | "watch" | "high"
      semester_type: "semester_1" | "semester_2"
      severity_level: "low" | "medium" | "high" | "critical"
      skill_level: "excellent" | "good" | "fair" | "poor" | "critical"
      student_status:
        | "active"
        | "graduated"
        | "transferred"
        | "dropped_out"
        | "suspended"
      submission_status:
        | "submitted"
        | "late_submitted"
        | "not_submitted"
        | "resubmitted"
      support_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "referred"
      support_type:
        | "academic"
        | "behavioral"
        | "emotional"
        | "financial"
        | "health"
        | "family"
        | "social"
        | "other"
      user_role:
        | "admin"
        | "director"
        | "homeroom_teacher"
        | "counselor"
        | "subject_teacher"
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
      attendance_status: ["present", "absent", "late", "leave", "sick"],
      audit_action: [
        "INSERT",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "IMPORT",
      ],
      behavior_type: ["positive", "negative", "neutral"],
      gender_type: ["male", "female", "other"],
      goal_status: [
        "not_started",
        "in_progress",
        "achieved",
        "not_achieved",
        "cancelled",
      ],
      grade_level: [
        "p1",
        "p2",
        "p3",
        "p4",
        "p5",
        "p6",
        "m1",
        "m2",
        "m3",
        "m4",
        "m5",
        "m6",
      ],
      guardian_relation: [
        "father",
        "mother",
        "grandfather",
        "grandmother",
        "uncle",
        "aunt",
        "sibling",
        "other_relative",
        "guardian",
      ],
      housing_condition: ["good", "moderate", "poor", "critical"],
      notification_type: [
        "risk_alert",
        "attendance_alert",
        "assignment_alert",
        "behavior_alert",
        "home_visit_reminder",
        "plan_review",
        "system",
        "general",
      ],
      plan_status: ["draft", "active", "completed", "cancelled"],
      risk_level: ["normal", "watch", "high"],
      semester_type: ["semester_1", "semester_2"],
      severity_level: ["low", "medium", "high", "critical"],
      skill_level: ["excellent", "good", "fair", "poor", "critical"],
      student_status: [
        "active",
        "graduated",
        "transferred",
        "dropped_out",
        "suspended",
      ],
      submission_status: [
        "submitted",
        "late_submitted",
        "not_submitted",
        "resubmitted",
      ],
      support_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "referred",
      ],
      support_type: [
        "academic",
        "behavioral",
        "emotional",
        "financial",
        "health",
        "family",
        "social",
        "other",
      ],
      user_role: [
        "admin",
        "director",
        "homeroom_teacher",
        "counselor",
        "subject_teacher",
      ],
    },
  },
} as const

