/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = string | number | boolean | null | { [key: string]: any } | any[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          end_time: string | null;
          id: string;
          image_url: string | null;
          location: string;
          organizer: string | null;
          start_time: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string;
          end_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string;
          organizer?: string | null;
          start_time: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          end_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string;
          organizer?: string | null;
          start_time?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_participants: {
        Row: {
          activity_id: string;
          cadet_enrollment_id: string;
          id: string;
          registered_at: string;
          remarks: string | null;
          status: string;
        };
        Insert: {
          activity_id: string;
          cadet_enrollment_id: string;
          id?: string;
          registered_at?: string;
          remarks?: string | null;
          status?: string;
        };
        Update: {
          activity_id?: string;
          cadet_enrollment_id?: string;
          id?: string;
          registered_at?: string;
          remarks?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      activity_photos: {
        Row: {
          activity_id: string;
          caption: string | null;
          created_at: string;
          id: string;
          photo_url: string;
          uploaded_by: string;
        };
        Insert: {
          activity_id: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          photo_url: string;
          uploaded_by?: string;
        };
        Update: {
          activity_id?: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          photo_url?: string;
          uploaded_by?: string;
        };
        Relationships: [];
      };
      annual_plans: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          plan_year: number;
          remarks: string | null;
          status: string;
          target_month: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          plan_year?: number;
          remarks?: string | null;
          status?: string;
          target_month: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          plan_year?: number;
          remarks?: string | null;
          status?: string;
          target_month?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          actor: string;
          created_at: string;
          id: string;
          ip: string;
          metadata: Json | null;
          target: string;
        };
        Insert: {
          action: string;
          actor: string;
          created_at?: string;
          id?: string;
          ip?: string;
          metadata?: Json | null;
          target?: string;
        };
        Update: {
          action?: string;
          actor?: string;
          created_at?: string;
          id?: string;
          ip?: string;
          metadata?: Json | null;
          target?: string;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          end_time: string;
          event_type: string;
          id: string;
          is_all_day: boolean | null;
          location: string | null;
          published_at: string | null;
          start_time: string;
          status: string;
          timezone: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_time: string;
          event_type?: string;
          id?: string;
          is_all_day?: boolean | null;
          location?: string | null;
          published_at?: string | null;
          start_time: string;
          status?: string;
          timezone?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          end_time?: string;
          event_type?: string;
          id?: string;
          is_all_day?: boolean | null;
          location?: string | null;
          published_at?: string | null;
          start_time?: string;
          status?: string;
          timezone?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      staff_attendance: {
        Row: {
          clock_in: string;
          clock_out: string | null;
          created_at: string;
          date: string;
          duty_location: string | null;
          id: string;
          remarks: string | null;
          staff_name: string;
          staff_role: string;
        };
        Insert: {
          clock_in?: string;
          clock_out?: string | null;
          created_at?: string;
          date?: string;
          duty_location?: string | null;
          id?: string;
          remarks?: string | null;
          staff_name: string;
          staff_role?: string;
        };
        Update: {
          clock_in?: string;
          clock_out?: string | null;
          created_at?: string;
          date?: string;
          duty_location?: string | null;
          id?: string;
          remarks?: string | null;
          staff_name?: string;
          staff_role?: string;
        };
        Relationships: [];
      };
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
          read: boolean;
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          action_label?: string | null;
          action_type?: string | null;
          body: string;
          category?: string;
          created_at?: string;
          id?: string;
          priority?: string;
          read?: boolean;
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          action_label?: string | null;
          action_type?: string | null;
          body?: string;
          category?: string;
          created_at?: string;
          id?: string;
          priority?: string;
          read?: boolean;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      calendar_event_attendees: {
        Row: {
          cadet_enrollment_id: string;
          event_id: string;
          id: string;
          invited_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          cadet_enrollment_id: string;
          event_id: string;
          id?: string;
          invited_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          cadet_enrollment_id?: string;
          event_id?: string;
          id?: string;
          invited_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      calendar_event_reminders: {
        Row: {
          channel: string;
          created_at: string;
          event_id: string;
          id: string;
          offset_minutes: number;
          recipient_scope: string;
          scheduled_for: string;
          sent_at: string | null;
          status: string;
        };
        Insert: {
          channel?: string;
          created_at?: string;
          event_id: string;
          id?: string;
          offset_minutes: number;
          recipient_scope?: string;
          scheduled_for: string;
          sent_at?: string | null;
          status?: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          event_id?: string;
          id?: string;
          offset_minutes?: number;
          recipient_scope?: string;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      notification_deliveries: {
        Row: {
          attempt_count: number;
          channel: string;
          created_at: string;
          error_code: string | null;
          failed_at: string | null;
          id: string;
          notification_id: string;
          recipient_id: string;
          sent_at: string | null;
          status: string;
        };
        Insert: {
          attempt_count?: number;
          channel?: string;
          created_at?: string;
          error_code?: string | null;
          failed_at?: string | null;
          id?: string;
          notification_id: string;
          recipient_id: string;
          sent_at?: string | null;
          status?: string;
        };
        Update: {
          attempt_count?: number;
          channel?: string;
          created_at?: string;
          error_code?: string | null;
          failed_at?: string | null;
          id?: string;
          notification_id?: string;
          recipient_id?: string;
          sent_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      email_jobs: {
        Row: {
          attempts: number;
          created_at: string;
          error_message: string | null;
          id: string;
          job_type: string;
          payload: Json;
          processed_at: string | null;
          recipient: string;
          scheduled_at: string;
          status: string;
        };
        Insert: {
          attempts?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          job_type: string;
          payload?: Json;
          processed_at?: string | null;
          recipient: string;
          scheduled_at?: string;
          status?: string;
        };
        Update: {
          attempts?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          job_type?: string;
          payload?: Json;
          processed_at?: string | null;
          recipient?: string;
          scheduled_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      email_delivery_logs: {
        Row: {
          email_job_id: string | null;
          error_details: string | null;
          id: string;
          recipient: string;
          sent_at: string;
          smtp_message_id: string | null;
          status: string;
          subject: string;
        };
        Insert: {
          email_job_id?: string | null;
          error_details?: string | null;
          id?: string;
          recipient: string;
          sent_at?: string;
          smtp_message_id?: string | null;
          status?: string;
          subject: string;
        };
        Update: {
          email_job_id?: string | null;
          error_details?: string | null;
          id?: string;
          recipient?: string;
          sent_at?: string;
          smtp_message_id?: string | null;
          status?: string;
          subject?: string;
        };
        Relationships: [];
      };
      cadet_users: {
        Row: {
          account_status: string;
          activated_at: string | null;
          application_id: string;
          cadet_id: string;
          created_at: string;
          email: string;
          id: string;
          last_login_at: string | null;
          password_hash: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          account_status?: string;
          activated_at?: string | null;
          application_id: string;
          cadet_id: string;
          created_at?: string;
          email: string;
          id?: string;
          last_login_at?: string | null;
          password_hash?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          account_status?: string;
          activated_at?: string | null;
          application_id?: string;
          cadet_id?: string;
          created_at?: string;
          email?: string;
          id?: string;
          last_login_at?: string | null;
          password_hash?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      account_activation_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_progress: {
        Row: {
          completed_at: string | null;
          contact_verified: boolean;
          declaration_accepted: boolean;
          documents_verified: boolean;
          onboarding_completed: boolean;
          orientation_completed: boolean;
          profile_completed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          contact_verified?: boolean;
          declaration_accepted?: boolean;
          documents_verified?: boolean;
          onboarding_completed?: boolean;
          orientation_completed?: boolean;
          profile_completed?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          contact_verified?: boolean;
          declaration_accepted?: boolean;
          documents_verified?: boolean;
          onboarding_completed?: boolean;
          orientation_completed?: boolean;
          profile_completed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      storage_upload_intents: {
        Row: {
          allowed_mime: string;
          bucket: string;
          checksum: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          max_size_bytes: number;
          object_key: string;
          opaque_intent_id: string;
          operation: string;
          resource_id: string;
          resource_type: string;
          status: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          allowed_mime: string;
          bucket: string;
          checksum?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          max_size_bytes: number;
          object_key: string;
          opaque_intent_id: string;
          operation?: string;
          resource_id: string;
          resource_type: string;
          status?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          allowed_mime?: string;
          bucket?: string;
          checksum?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          max_size_bytes?: number;
          object_key?: string;
          opaque_intent_id?: string;
          operation?: string;
          resource_id?: string;
          resource_type?: string;
          status?: string;
          token_hash?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      storage_objects: {
        Row: {
          bucket: string;
          checksum: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          mime_type: string;
          object_key: string;
          opaque_object_id: string;
          owner_id: string;
          resource_id: string;
          resource_type: string;
          size_bytes: number;
          status: string;
          verified_at: string | null;
        };
        Insert: {
          bucket: string;
          checksum?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          mime_type: string;
          object_key: string;
          opaque_object_id: string;
          owner_id: string;
          resource_id: string;
          resource_type: string;
          size_bytes: number;
          status?: string;
          verified_at?: string | null;
        };
        Update: {
          bucket?: string;
          checksum?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          mime_type?: string;
          object_key?: string;
          opaque_object_id?: string;
          owner_id?: string;
          resource_id?: string;
          resource_type?: string;
          size_bytes?: number;
          status?: string;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      storage_access_grants: {
        Row: {
          created_at: string;
          expires_at: string;
          grant_token_hash: string;
          id: string;
          object_id: string;
          opaque_grant_id: string;
          operation: string;
          revoked_at: string | null;
          status: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          grant_token_hash: string;
          id?: string;
          object_id: string;
          opaque_grant_id: string;
          operation?: string;
          revoked_at?: string | null;
          status?: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          grant_token_hash?: string;
          id?: string;
          object_id?: string;
          opaque_grant_id?: string;
          operation?: string;
          revoked_at?: string | null;
          status?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ids_events: {
        Row: {
          actor_id: string | null;
          actor_ip: string;
          created_at: string;
          details: Json;
          event_type: string;
          id: string;
          risk_score: number;
        };
        Insert: {
          actor_id?: string | null;
          actor_ip: string;
          created_at?: string;
          details?: Json;
          event_type: string;
          id?: string;
          risk_score?: number;
        };
        Update: {
          actor_id?: string | null;
          actor_ip?: string;
          created_at?: string;
          details?: Json;
          event_type?: string;
          id?: string;
          risk_score?: number;
        };
        Relationships: [];
      };
      ids_alerts: {
        Row: {
          alert_level: string;
          created_at: string;
          description: string;
          event_id: string | null;
          id: string;
          status: string;
          title: string;
        };
        Insert: {
          alert_level: string;
          created_at?: string;
          description: string;
          event_id?: string | null;
          id?: string;
          status?: string;
          title: string;
        };
        Update: {
          alert_level?: string;
          created_at?: string;
          description?: string;
          event_id?: string | null;
          id?: string;
          status?: string;
          title?: string;
        };
        Relationships: [];
      };
      ids_actions: {
        Row: {
          action_type: string;
          alert_id: string | null;
          executed_at: string;
          id: string;
          status: string;
          target_resource: string | null;
        };
        Insert: {
          action_type: string;
          alert_id?: string | null;
          executed_at?: string;
          id?: string;
          status?: string;
          target_resource?: string | null;
        };
        Update: {
          action_type?: string;
          alert_id?: string | null;
          executed_at?: string;
          id?: string;
          status?: string;
          target_resource?: string | null;
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
