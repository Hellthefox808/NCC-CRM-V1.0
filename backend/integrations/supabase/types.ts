export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      app_credentials: {
        Row: {
          created_at: string;
          identifier: string;
          password_hash: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          identifier: string;
          password_hash: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          identifier?: string;
          password_hash?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_sessions: {
        Row: {
          cadet_enrollment_id: string | null;
          created_at: string;
          display_name: string;
          email: string;
          expires_at: string;
          id: string;
          role: string;
          token: string;
        };
        Insert: {
          cadet_enrollment_id?: string | null;
          created_at?: string;
          display_name?: string;
          email: string;
          expires_at: string;
          id?: string;
          role?: string;
          token: string;
        };
        Update: {
          cadet_enrollment_id?: string | null;
          created_at?: string;
          display_name?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          role?: string;
          token?: string;
        };
        Relationships: [];
      };
      auth_otp_codes: {
        Row: {
          attempts: number;
          code_hash: string;
          consumed_at: string | null;
          created_at: string;
          destination: string | null;
          expires_at: string;
          id: string;
          identifier: string;
          purpose: string;
        };
        Insert: {
          attempts?: number;
          code_hash: string;
          consumed_at?: string | null;
          created_at?: string;
          destination?: string | null;
          expires_at: string;
          id?: string;
          identifier: string;
          purpose?: string;
        };
        Update: {
          attempts?: number;
          code_hash?: string;
          consumed_at?: string | null;
          created_at?: string;
          destination?: string | null;
          expires_at?: string;
          id?: string;
          identifier?: string;
          purpose?: string;
        };
        Relationships: [];
      };
      cadet_enrollments: {
        Row: {
          aadhaar_number: string;
          account_number: string;
          application_date: string;
          bank_name: string;
          blood_group: string;
          created_at: string;
          dob: string;
          email: string;
          enrollment_no: string | null;
          full_name: string;
          gender: string;
          guardian_mobile: string;
          guardian_name: string;
          guardian_relation: string;
          has_junior_certificate: boolean;
          height_cm: number;
          id: string;
          identification_mark: string;
          ifsc_code: string;
          junior_certificate_no: string | null;
          marks_percentage_10th: number;
          marks_percentage_12th: number;
          mobile: string;
          officer_remarks: string | null;
          permanent_address: string;
          pin_code: string;
          present_address: string;
          pushups_count: number;
          run_1600m_time: string;
          sbu_course: string;
          sbu_department: string;
          sbu_roll_no: string;
          sbu_semester: string;
          sbu_year: string;
          selection_rank: number | null;
          sports_details: string | null;
          sports_level: string;
          status: string;
          updated_at: string;
          weight_kg: number;
        };
        Insert: {
          aadhaar_number: string;
          account_number?: string;
          application_date?: string;
          bank_name?: string;
          blood_group?: string;
          created_at?: string;
          dob: string;
          email?: string;
          enrollment_no?: string | null;
          full_name: string;
          gender?: string;
          guardian_mobile?: string;
          guardian_name?: string;
          guardian_relation?: string;
          has_junior_certificate?: boolean;
          height_cm?: number;
          id: string;
          identification_mark?: string;
          ifsc_code?: string;
          junior_certificate_no?: string | null;
          marks_percentage_10th?: number;
          marks_percentage_12th?: number;
          mobile: string;
          officer_remarks?: string | null;
          permanent_address?: string;
          pin_code?: string;
          present_address?: string;
          pushups_count?: number;
          run_1600m_time?: string;
          sbu_course?: string;
          sbu_department?: string;
          sbu_roll_no?: string;
          sbu_semester?: string;
          sbu_year?: string;
          selection_rank?: number | null;
          sports_details?: string | null;
          sports_level?: string;
          status?: string;
          updated_at?: string;
          weight_kg?: number;
        };
        Update: {
          aadhaar_number?: string;
          account_number?: string;
          application_date?: string;
          bank_name?: string;
          blood_group?: string;
          created_at?: string;
          dob?: string;
          email?: string;
          enrollment_no?: string | null;
          full_name?: string;
          gender?: string;
          guardian_mobile?: string;
          guardian_name?: string;
          guardian_relation?: string;
          has_junior_certificate?: boolean;
          height_cm?: number;
          id?: string;
          identification_mark?: string;
          ifsc_code?: string;
          junior_certificate_no?: string | null;
          marks_percentage_10th?: number;
          marks_percentage_12th?: number;
          mobile?: string;
          officer_remarks?: string | null;
          permanent_address?: string;
          pin_code?: string;
          present_address?: string;
          pushups_count?: number;
          run_1600m_time?: string;
          sbu_course?: string;
          sbu_department?: string;
          sbu_roll_no?: string;
          sbu_semester?: string;
          sbu_year?: string;
          selection_rank?: number | null;
          sports_details?: string | null;
          sports_level?: string;
          status?: string;
          updated_at?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
      cadets: {
        Row: {
          aadhaar_number: string | null;
          account_holder_name: string | null;
          ano_name: string | null;
          area: string | null;
          bank_account_number: string | null;
          batch: string | null;
          behaviour: string | null;
          blood_group: string | null;
          branch: string | null;
          building: string | null;
          city: string | null;
          co_curricular: string | null;
          course: string | null;
          created_at: string;
          criminal_record: string | null;
          distinction: string | null;
          dob: string | null;
          email: string | null;
          enrollment_id: string;
          father_name: string | null;
          full_name: string | null;
          gender: string | null;
          group_hq: string | null;
          house_no: string | null;
          id: string;
          identification_mark: string | null;
          ifsc_code: string | null;
          institute: string | null;
          medical_complaint: string | null;
          mobile: string | null;
          mother_name: string | null;
          nationality: string | null;
          nearest_railway_station: string | null;
          nok_address: string | null;
          nok_contact: string | null;
          nok_name: string | null;
          nok_relationship: string | null;
          participation: string | null;
          performance: string | null;
          pin_code: string | null;
          previously_applied: string | null;
          rank: string | null;
          sbu_id: string | null;
          section: string | null;
          semester: string | null;
          sports_games: string | null;
          state: string | null;
          stipend_received: string | null;
          updated_at: string;
          willing_military_training: string | null;
          willing_serve_ncc: string | null;
          wing: string | null;
          wing_type: string | null;
        };
        Insert: {
          aadhaar_number?: string | null;
          account_holder_name?: string | null;
          ano_name?: string | null;
          area?: string | null;
          bank_account_number?: string | null;
          batch?: string | null;
          behaviour?: string | null;
          blood_group?: string | null;
          branch?: string | null;
          building?: string | null;
          city?: string | null;
          co_curricular?: string | null;
          course?: string | null;
          created_at?: string;
          criminal_record?: string | null;
          distinction?: string | null;
          dob?: string | null;
          email?: string | null;
          enrollment_id: string;
          father_name?: string | null;
          full_name?: string | null;
          gender?: string | null;
          group_hq?: string | null;
          house_no?: string | null;
          id?: string;
          identification_mark?: string | null;
          ifsc_code?: string | null;
          institute?: string | null;
          medical_complaint?: string | null;
          mobile?: string | null;
          mother_name?: string | null;
          nationality?: string | null;
          nearest_railway_station?: string | null;
          nok_address?: string | null;
          nok_contact?: string | null;
          nok_name?: string | null;
          nok_relationship?: string | null;
          participation?: string | null;
          performance?: string | null;
          pin_code?: string | null;
          previously_applied?: string | null;
          rank?: string | null;
          sbu_id?: string | null;
          section?: string | null;
          semester?: string | null;
          sports_games?: string | null;
          state?: string | null;
          stipend_received?: string | null;
          updated_at?: string;
          willing_military_training?: string | null;
          willing_serve_ncc?: string | null;
          wing?: string | null;
          wing_type?: string | null;
        };
        Update: {
          aadhaar_number?: string | null;
          account_holder_name?: string | null;
          ano_name?: string | null;
          area?: string | null;
          bank_account_number?: string | null;
          batch?: string | null;
          behaviour?: string | null;
          blood_group?: string | null;
          branch?: string | null;
          building?: string | null;
          city?: string | null;
          co_curricular?: string | null;
          course?: string | null;
          created_at?: string;
          criminal_record?: string | null;
          distinction?: string | null;
          dob?: string | null;
          email?: string | null;
          enrollment_id?: string;
          father_name?: string | null;
          full_name?: string | null;
          gender?: string | null;
          group_hq?: string | null;
          house_no?: string | null;
          id?: string;
          identification_mark?: string | null;
          ifsc_code?: string | null;
          institute?: string | null;
          medical_complaint?: string | null;
          mobile?: string | null;
          mother_name?: string | null;
          nationality?: string | null;
          nearest_railway_station?: string | null;
          nok_address?: string | null;
          nok_contact?: string | null;
          nok_name?: string | null;
          nok_relationship?: string | null;
          participation?: string | null;
          performance?: string | null;
          pin_code?: string | null;
          previously_applied?: string | null;
          rank?: string | null;
          sbu_id?: string | null;
          section?: string | null;
          semester?: string | null;
          sports_games?: string | null;
          state?: string | null;
          stipend_received?: string | null;
          updated_at?: string;
          willing_military_training?: string | null;
          willing_serve_ncc?: string | null;
          wing?: string | null;
          wing_type?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_label: string | null;
          action_type: string | null;
          body: string;
          category: string;
          created_at: string;
          id: string;
          priority: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          action_label?: string | null;
          action_type?: string | null;
          body: string;
          category?: string;
          created_at?: string;
          id?: string;
          priority?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          action_label?: string | null;
          action_type?: string | null;
          body?: string;
          category?: string;
          created_at?: string;
          id?: string;
          priority?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
