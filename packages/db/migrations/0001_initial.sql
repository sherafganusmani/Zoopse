CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'archived');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'medical_leave', 'od_leave', 'holiday', 'cancelled', 'half_day');
CREATE TYPE leave_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'cancelled');
CREATE TYPE notice_priority AS ENUM ('normal', 'important', 'urgent');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(180) NOT NULL,
  code varchar(32) NOT NULL UNIQUE,
  domain varchar(180),
  logo_url text,
  timezone varchar(80) NOT NULL DEFAULT 'Asia/Kolkata',
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(120) NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id),
  email varchar(180) NOT NULL,
  phone varchar(32),
  password_hash text NOT NULL,
  full_name varchar(160) NOT NULL,
  avatar_url text,
  status user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, email)
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL,
  code varchar(32) NOT NULL,
  hod_user_id uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name varchar(140) NOT NULL,
  code varchar(32) NOT NULL,
  duration_years integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name varchar(140) NOT NULL,
  code varchar(32) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name varchar(32) NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester integer NOT NULL,
  name varchar(16) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  name varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE faculty_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id),
  employee_code varchar(64) NOT NULL,
  designation varchar(120) NOT NULL,
  joining_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE parent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  occupation varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parent_profiles(id),
  division_id uuid NOT NULL REFERENCES divisions(id),
  batch_id uuid REFERENCES batches(id),
  roll_number varchar(32) NOT NULL,
  prn varchar(64) NOT NULL UNIQUE,
  admission_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  code varchar(32) NOT NULL,
  name varchar(160) NOT NULL,
  semester integer NOT NULL,
  credits numeric(4, 1) NOT NULL,
  is_lab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  division_id uuid NOT NULL REFERENCES divisions(id),
  batch_id uuid REFERENCES batches(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id),
  day_of_week integer NOT NULL,
  starts_at varchar(8) NOT NULL,
  ends_at varchar(8) NOT NULL,
  room varchar(80),
  is_lab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  timetable_slot_id uuid REFERENCES timetable_slots(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id),
  division_id uuid NOT NULL REFERENCES divisions(id),
  batch_id uuid REFERENCES batches(id),
  session_date date NOT NULL,
  starts_at varchar(8) NOT NULL,
  ends_at varchar(8) NOT NULL,
  mode varchar(40) NOT NULL DEFAULT 'manual',
  locked_at timestamptz,
  cancelled_at timestamptz,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL,
  marked_by_user_id uuid NOT NULL REFERENCES users(id),
  marked_at timestamptz NOT NULL DEFAULT now(),
  source varchar(40) NOT NULL DEFAULT 'manual',
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);

CREATE TABLE attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_record_id uuid NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  previous_status attendance_status,
  next_status attendance_status NOT NULL,
  reason text,
  ip_address varchar(64),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  holiday_date date NOT NULL,
  applies_to jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leave_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  applicant_user_id uuid NOT NULL REFERENCES users(id),
  approver_user_id uuid REFERENCES users(id),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  type varchar(60) NOT NULL,
  status leave_status NOT NULL DEFAULT 'submitted',
  reason text NOT NULL,
  document_url text,
  reviewer_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES users(id),
  title varchar(180) NOT NULL,
  type varchar(60) NOT NULL,
  url text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id),
  title varchar(180) NOT NULL,
  description text,
  due_at timestamptz NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  recipient_user_id uuid REFERENCES users(id),
  title varchar(180) NOT NULL,
  body text NOT NULL,
  channel varchar(40) NOT NULL,
  priority notice_priority NOT NULL DEFAULT 'normal',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  generated_by_user_id uuid NOT NULL REFERENCES users(id),
  type varchar(80) NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  key varchar(120) NOT NULL,
  value jsonb NOT NULL,
  is_encrypted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX settings_college_key_idx ON settings(college_id, key);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id),
  action varchar(140) NOT NULL,
  entity varchar(120) NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address varchar(64),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  ip_address varchar(64),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  plan_name varchar(80) NOT NULL,
  status varchar(40) NOT NULL,
  seats integer NOT NULL,
  current_period_ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_number varchar(80) NOT NULL UNIQUE,
  amount numeric(12, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_at timestamptz NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  provider varchar(80) NOT NULL,
  provider_payment_id varchar(160),
  amount numeric(12, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  opened_by_user_id uuid REFERENCES users(id),
  subject varchar(180) NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'open',
  priority varchar(40) NOT NULL DEFAULT 'normal',
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  event varchar(140) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX attendance_sessions_college_date_idx ON attendance_sessions(college_id, session_date);
CREATE INDEX attendance_records_status_idx ON attendance_records(status);
CREATE INDEX audit_logs_college_created_idx ON audit_logs(college_id, created_at DESC);
