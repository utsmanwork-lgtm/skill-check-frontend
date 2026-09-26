-- Migration: 20260926000000_init_skill_check.sql
-- Description: 6 core tables + profiles, RLS, triggers, functions (security definer with fixed search_path)

-- 1. Profiles Table (1-to-1 with auth.users for role management)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guru' CHECK (role IN ('admin', 'guru', 'siswa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nis VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'Teknik Kendaraan Ringan',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skill Indicators Table
CREATE TABLE IF NOT EXISTS public.skill_indicators (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    sop_standard TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_skill_step UNIQUE (skill_id, step_order)
);

-- 5. Student Skill Status Table
CREATE TABLE IF NOT EXISTS public.student_skill_status (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'proses', 'lulus')),
    assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    passed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_skill UNIQUE (student_id, skill_id)
);

-- 6. Assessment Checks Table
CREATE TABLE IF NOT EXISTS public.assessment_checks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    indicator_id BIGINT NOT NULL REFERENCES public.skill_indicators(id) ON DELETE CASCADE,
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_indicator UNIQUE (student_id, indicator_id)
);

-- Helper function: Get user role from profiles with strict search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Trigger Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'guru')
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger Function: Auto-calculate student_skill_status when assessment_checks is inserted/updated
CREATE OR REPLACE FUNCTION public.update_student_skill_status_on_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_skill_id BIGINT;
    v_total_indicators INT;
    v_checked_indicators INT;
BEGIN
    -- Dapatkan skill_id dari indikator
    SELECT skill_id INTO v_skill_id
    FROM public.skill_indicators
    WHERE id = NEW.indicator_id;

    IF v_skill_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Hitung total indikator aktif pada modul ini
    SELECT COUNT(*) INTO v_total_indicators
    FROM public.skill_indicators
    WHERE skill_id = v_skill_id;

    -- Hitung indikator yang sudah diceklis untuk siswa ini
    SELECT COUNT(*) INTO v_checked_indicators
    FROM public.assessment_checks ac
    JOIN public.skill_indicators si ON ac.indicator_id = si.id
    WHERE ac.student_id = NEW.student_id
      AND si.skill_id = v_skill_id
      AND ac.is_checked = TRUE;

    -- Tentukan status
    IF v_checked_indicators = v_total_indicators AND v_total_indicators > 0 THEN
        INSERT INTO public.student_skill_status (student_id, skill_id, status, assessed_by, passed_at, updated_at)
        VALUES (NEW.student_id, v_skill_id, 'lulus', auth.uid(), NOW(), NOW())
        ON CONFLICT (student_id, skill_id)
        DO UPDATE SET
            status = 'lulus',
            assessed_by = auth.uid(),
            passed_at = NOW(),
            updated_at = NOW();
    ELSIF v_checked_indicators > 0 THEN
        INSERT INTO public.student_skill_status (student_id, skill_id, status, assessed_by, passed_at, updated_at)
        VALUES (NEW.student_id, v_skill_id, 'proses', auth.uid(), NULL, NOW())
        ON CONFLICT (student_id, skill_id)
        DO UPDATE SET
            status = 'proses',
            assessed_by = auth.uid(),
            passed_at = NULL,
            updated_at = NOW();
    ELSE
        INSERT INTO public.student_skill_status (student_id, skill_id, status, assessed_by, passed_at, updated_at)
        VALUES (NEW.student_id, v_skill_id, 'belum', auth.uid(), NULL, NOW())
        ON CONFLICT (student_id, skill_id)
        DO UPDATE SET
            status = 'belum',
            assessed_by = auth.uid(),
            passed_at = NULL,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_assessment_check_status_update
AFTER INSERT OR UPDATE ON public.assessment_checks
FOR EACH ROW EXECUTE FUNCTION public.update_student_skill_status_on_check();

-- Stored Procedure: Reset / Remedial function
CREATE OR REPLACE FUNCTION public.reset_student_skill(p_student_id BIGINT, p_skill_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Verifikasi pemanggil: minimal role guru atau admin
    IF public.get_current_user_role() NOT IN ('guru', 'admin') THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya guru atau admin yang dapat mereset evaluasi.';
    END IF;

    -- Reset semua check di assessment_checks untuk skill ini
    UPDATE public.assessment_checks ac
    SET is_checked = FALSE, updated_at = NOW()
    FROM public.skill_indicators si
    WHERE ac.indicator_id = si.id
      AND ac.student_id = p_student_id
      AND si.skill_id = p_skill_id;

    -- Update status kembali ke 'belum'
    INSERT INTO public.student_skill_status (student_id, skill_id, status, assessed_by, passed_at, updated_at)
    VALUES (p_student_id, p_skill_id, 'belum', auth.uid(), NULL, NOW())
    ON CONFLICT (student_id, skill_id)
    DO UPDATE SET
        status = 'belum',
        assessed_by = auth.uid(),
        passed_at = NULL,
        updated_at = NOW();
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_checks ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin');

-- 2. Students
CREATE POLICY "Students viewable by authenticated users"
    ON public.students FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Only admins can insert/update/delete students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- 3. Skills
CREATE POLICY "Skills viewable by authenticated users"
    ON public.skills FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Only admins can manage skills"
    ON public.skills FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- 4. Skill Indicators
CREATE POLICY "Skill indicators viewable by authenticated users"
    ON public.skill_indicators FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Only admins can manage skill indicators"
    ON public.skill_indicators FOR ALL
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- 5. Student Skill Status
CREATE POLICY "Status viewable by authenticated users"
    ON public.student_skill_status FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Teachers and admins can update or insert status"
    ON public.student_skill_status FOR ALL
    TO authenticated
    USING (public.get_current_user_role() IN ('guru', 'admin'))
    WITH CHECK (public.get_current_user_role() IN ('guru', 'admin'));

-- 6. Assessment Checks
CREATE POLICY "Checks viewable by authenticated users"
    ON public.assessment_checks FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Teachers and admins can insert or update checks"
    ON public.assessment_checks FOR INSERT
    TO authenticated
    WITH CHECK (public.get_current_user_role() IN ('guru', 'admin'));

CREATE POLICY "Teachers and admins can modify checks"
    ON public.assessment_checks FOR UPDATE
    TO authenticated
    USING (public.get_current_user_role() IN ('guru', 'admin'))
    WITH CHECK (public.get_current_user_role() IN ('guru', 'admin'));

CREATE POLICY "Teachers and admins can delete checks"
    ON public.assessment_checks FOR DELETE
    TO authenticated
    USING (public.get_current_user_role() IN ('guru', 'admin'));
