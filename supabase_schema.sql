CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE academic_session AS ENUM ('Morning', 'Afternoon', 'Evening', 'Weekend');
CREATE TYPE student_level AS ENUM ('100', '200', '300', '400');
CREATE TYPE qualification_type AS ENUM ('Diploma', 'Degree', 'Masters', 'PhD');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused');
CREATE TYPE payment_status AS ENUM ('Pending', 'Paid');


CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    other_names VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    programme VARCHAR(50) NOT NULL,
    level student_level NOT NULL DEFAULT '100',
    session academic_session NOT NULL DEFAULT 'Morning',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    qualification qualification_type NOT NULL DEFAULT 'Degree',
    session academic_session NOT NULL DEFAULT 'Morning',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);


CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    credit_hours INT NOT NULL DEFAULT 3,
    level student_level NOT NULL,
    session academic_session NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    semester VARCHAR(20) DEFAULT 'Semester 1',
    academic_year VARCHAR(20) DEFAULT '2025/2026',
    UNIQUE(student_id, course_id, semester, academic_year)
);


CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'Present',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    assessment_score NUMERIC(5,2) DEFAULT 0,
    exam_score NUMERIC(5,2) DEFAULT 0,
    total_score NUMERIC(5,2) GENERATED ALWAYS AS (assessment_score + exam_score) STORED,
    letter_grade VARCHAR(2),
    grade_point NUMERIC(3,2),
    semester VARCHAR(20) DEFAULT 'Semester 1',
    academic_year VARCHAR(20) DEFAULT '2025/2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    semester VARCHAR(20) DEFAULT 'Semester 1',
    academic_year VARCHAR(20) DEFAULT '2025/2026',
    total_amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) DEFAULT 0,
    balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status payment_status DEFAULT 'Pending',
    payment_method VARCHAR(50),
    transaction_ref VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'all',
    posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',email
    channel VARCHAR(50) DEFAULT 'in_app', 
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


CREATE POLICY admin_all_profiles ON profiles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_students ON students FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_teachers ON teachers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_parents ON parents FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_courses ON courses FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_enrollments ON enrollments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_attendance ON attendance FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_grades ON grades FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_fees ON fees FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


CREATE POLICY public_announcements ON announcements FOR SELECT USING (true);


CREATE POLICY student_view_own_data ON students FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY student_view_own_grades ON grades FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY student_view_own_attendance ON attendance FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY student_view_own_fees ON fees FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);


CREATE POLICY teacher_view_students ON students FOR SELECT USING (auth.jwt() ->> 'role' = 'teacher');
CREATE POLICY teacher_manage_attendance ON attendance FOR ALL USING (auth.jwt() ->> 'role' = 'teacher');
CREATE POLICY teacher_manage_grades ON grades FOR ALL USING (auth.jwt() ->> 'role' = 'teacher');
CREATE POLICY teacher_manage_courses ON courses FOR ALL USING (auth.jwt() ->> 'role' = 'teacher');


CREATE POLICY parent_view_linked_student_grades ON grades FOR SELECT USING (
    student_id IN (
        SELECT student_id FROM parent_student_links 
        WHERE parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
    )
);



INSERT INTO profiles (id, email, full_name, phone_number, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@isms.edu.gh', 'Dr. Kwame Mensah (Admin)', '+233241000001', 'admin'),
('b0000000-0000-0000-0000-000000000002', 'teacher.boakye@isms.edu.gh', 'Prof. Emanuel Boakye', '+233241000002', 'teacher'),
('c0000000-0000-0000-0000-000000000003', 'student.abena@isms.edu.gh', 'Abena Osei Appiah', '+233241000003', 'student'),
('d0000000-0000-0000-0000-000000000004', 'parent.osei@isms.edu.gh', 'Mr. Kofi Osei Appiah', '+233241000004', 'parent')
ON CONFLICT DO NOTHING;

INSERT INTO students (id, profile_id, student_id, first_name, surname, other_names, email, phone_number, programme, level, session) VALUES
('11111111-1111-1111-1111-111111111111', 'c0000000-0000-0000-0000-000000000003', 'STU2025001', 'Abena', 'Appiah', 'Osei', 'student.abena@isms.edu.gh', '+233241000003', 'BSc Computer Science', '300', 'Morning')
ON CONFLICT DO NOTHING;

INSERT INTO teachers (id, profile_id, staff_id, full_name, email, phone_number, qualification, session) VALUES
('22222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000002', 'STF2025001', 'Prof. Emanuel Boakye', 'teacher.boakye@isms.edu.gh', '+233241000002', 'PhD', 'Morning')
ON CONFLICT DO NOTHING;

INSERT INTO parents (id, profile_id, full_name, email, phone_number) VALUES
('33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000004', 'Mr. Kofi Osei Appiah', 'parent.osei@isms.edu.gh', '+233241000004')
ON CONFLICT DO NOTHING;

INSERT INTO parent_student_links (parent_id, student_id) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;



CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can lookup profiles for login" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Public can lookup students for login" ON students
    FOR SELECT USING (true);

CREATE POLICY "Public can lookup teachers for login" ON teachers
    FOR SELECT USING (true);

CREATE POLICY "Public can lookup parents for login" ON parents
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE
    v_role public.user_role := 'student'::public.user_role;
    v_full_name TEXT;
    v_phone TEXT;
    v_student_id TEXT;
    v_staff_id TEXT;
    v_programme TEXT;
    v_level public.student_level := '100'::public.student_level;
    v_session public.academic_session := 'Morning'::public.academic_session;
    v_qualification public.qualification_type := 'Degree'::public.qualification_type;
    v_first_name TEXT;
    v_surname TEXT;
    v_other_names TEXT;
    v_avatar TEXT;
BEGIN
    BEGIN
        IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
            v_role := (new.raw_user_meta_data->>'role')::public.user_role;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'student'::public.user_role;
    END;

    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    v_phone := COALESCE(new.raw_user_meta_data->>'phone_number', '+233000000000');
    v_avatar := COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

    INSERT INTO public.profiles (id, email, full_name, phone_number, role, avatar_url)
    VALUES (new.id, new.email, v_full_name, v_phone, v_role, v_avatar)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        updated_at = NOW();

    IF v_role = 'student' THEN
        v_student_id := COALESCE(new.raw_user_meta_data->>'student_id', 'STU' || substring(replace(new.id::text, '-', ''), 1, 8));
        v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', split_part(v_full_name, ' ', 1));
        v_surname := COALESCE(new.raw_user_meta_data->>'surname', nullif(split_part(v_full_name, ' ', 2), ''), 'Student');
        v_other_names := COALESCE(new.raw_user_meta_data->>'other_names', '');
        v_programme := COALESCE(new.raw_user_meta_data->>'programme', 'BSc Computer Science');
        
        BEGIN
            IF new.raw_user_meta_data->>'level' IS NOT NULL THEN
                v_level := (new.raw_user_meta_data->>'level')::student_level;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_level := '100';
        END;

        BEGIN
            IF new.raw_user_meta_data->>'session' IS NOT NULL THEN
                v_session := (new.raw_user_meta_data->>'session')::academic_session;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_session := 'Morning';
        END;

        INSERT INTO public.students (
            profile_id, student_id, first_name, surname, other_names, email, phone_number, programme, level, session, avatar_url
        ) VALUES (
            new.id, v_student_id, v_first_name, v_surname, v_other_names, new.email, v_phone, v_programme, v_level, v_session, v_avatar
        ) ON CONFLICT (student_id) DO NOTHING;

    ELSIF v_role = 'teacher' THEN
        v_staff_id := COALESCE(new.raw_user_meta_data->>'staff_id', 'STF' || substring(replace(new.id::text, '-', ''), 1, 5));
        
        BEGIN
            IF new.raw_user_meta_data->>'qualification' IS NOT NULL THEN
                v_qualification := (new.raw_user_meta_data->>'qualification')::qualification_type;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_qualification := 'Degree';
        END;

        BEGIN
            IF new.raw_user_meta_data->>'session' IS NOT NULL THEN
                v_session := (new.raw_user_meta_data->>'session')::academic_session;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_session := 'Morning';
        END;

        INSERT INTO public.teachers (
            profile_id, staff_id, full_name, email, phone_number, qualification, session, avatar_url
        ) VALUES (
            new.id, v_staff_id, v_full_name, new.email, v_phone, v_qualification, v_session, v_avatar
        ) ON CONFLICT (staff_id) DO NOTHING;

    ELSIF v_role = 'parent' THEN
        INSERT INTO public.parents (
            profile_id, full_name, email, phone_number
        ) VALUES (
            new.id, v_full_name, new.email, v_phone
        ) ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
