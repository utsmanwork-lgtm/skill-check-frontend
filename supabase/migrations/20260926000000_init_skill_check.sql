-- Fase 1: Skema database Skill Check
-- Tables: profiles, rombel, siswa, skill_check, instruksi_kerja, penilaian, log_aktivitas
-- Views: v_progres
-- Functions: is_guru(), is_admin(), reset_skill_check()
-- Triggers: handle_new_user(), log_penilaian_after_insert, log_penilaian_after_delete

-- ============================================================================
-- 1. CORE TABLES (created first - no dependencies)
-- ============================================================================

-- 1.1 PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending', 'guru', 'admin')),
    aktif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_aktif ON public.profiles(aktif);

-- 1.2 ROMBEL TABLE
CREATE TABLE IF NOT EXISTS public.rombel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL UNIQUE,
    tingkat TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rombel_nama ON public.rombel(nama);

-- 1.3 SISWA TABLE
CREATE TABLE IF NOT EXISTS public.siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nis TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    rombel_id UUID REFERENCES public.rombel(id) ON DELETE SET NULL,
    aktif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_siswa_nis ON public.siswa(nis);
CREATE INDEX IF NOT EXISTS idx_siswa_rombel_id ON public.siswa(rombel_id);
CREATE INDEX IF NOT EXISTS idx_siswa_aktif ON public.siswa(aktif);

-- 1.4 SKILL_CHECK TABLE
CREATE TABLE IF NOT EXISTS public.skill_check (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    aktif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_check_kode ON public.skill_check(kode);
CREATE INDEX IF NOT EXISTS idx_skill_check_aktif ON public.skill_check(aktif);

-- 1.5 INSTRUKSI_KERJA TABLE
CREATE TABLE IF NOT EXISTS public.instruksi_kerja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_check_id UUID NOT NULL REFERENCES public.skill_check(id) ON DELETE CASCADE,
    urutan INT NOT NULL,
    deskripsi TEXT NOT NULL,
    aktif BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_instruksi_kerja_skill_check_id ON public.instruksi_kerja(skill_check_id);

-- 1.6 PENILAIAN TABLE (checklist, primary key = siswa_id + instruksi_id)
CREATE TABLE IF NOT EXISTS public.penilaian (
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    instruksi_id UUID NOT NULL REFERENCES public.instruksi_kerja(id) ON DELETE CASCADE,
    dinilai_oleh UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    dinilai_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (siswa_id, instruksi_id)
);

CREATE INDEX IF NOT EXISTS idx_penilaian_siswa_id ON public.penilaian(siswa_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_instruksi_id ON public.penilaian(instruksi_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_dinilai_oleh ON public.penilaian(dinilai_oleh);
CREATE INDEX IF NOT EXISTS idx_penilaian_dinilai_at ON public.penilaian(dinilai_at DESC);

-- 1.7 LOG_AKTIVITAS TABLE (immutable audit trail)
CREATE TABLE IF NOT EXISTS public.log_aktivitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waktu TIMESTAMPTZ DEFAULT now(),
    guru_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE RESTRICT,
    skill_check_id UUID NOT NULL REFERENCES public.skill_check(id) ON DELETE RESTRICT,
    instruksi_id UUID REFERENCES public.instruksi_kerja(id) ON DELETE SET NULL,
    aksi TEXT NOT NULL CHECK (aksi IN ('centang', 'batal', 'reset')),
    alasan TEXT
);

CREATE INDEX IF NOT EXISTS idx_log_aktivitas_waktu ON public.log_aktivitas(waktu DESC);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_guru_id ON public.log_aktivitas(guru_id);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_siswa_id ON public.log_aktivitas(siswa_id);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_skill_check_id ON public.log_aktivitas(skill_check_id);

-- ============================================================================
-- 2. HELPER FUNCTIONS (SECURITY DEFINER, STABLE) - Now profiles exists
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_guru()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role IN ('guru', 'admin') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================================
-- 3. VIEW: v_progres (progress per siswa × skill_check)
-- ============================================================================

CREATE OR REPLACE VIEW public.v_progres WITH (security_invoker = true) AS
SELECT
    s.id AS siswa_id,
    s.nis,
    s.nama AS nama_siswa,
    r.id AS rombel_id,
    r.nama AS nama_rombel,
    sc.id AS skill_check_id,
    sc.kode,
    sc.nama AS nama_skill_check,
    COUNT(DISTINCT ik.id) FILTER (WHERE ik.aktif = true) AS total,
    COUNT(DISTINCT p.instruksi_id) FILTER (WHERE ik.aktif = true) AS tercentang,
    ROUND(
        CASE
            WHEN COUNT(DISTINCT ik.id) FILTER (WHERE ik.aktif = true) = 0 THEN 0
            ELSE (COUNT(DISTINCT p.instruksi_id) FILTER (WHERE ik.aktif = true)::NUMERIC / 
                  COUNT(DISTINCT ik.id) FILTER (WHERE ik.aktif = true)) * 100
        END
    )::INT AS persen,
    CASE
        WHEN COUNT(DISTINCT ik.id) FILTER (WHERE ik.aktif = true) = 0 THEN 'belum_mulai'
        WHEN COUNT(DISTINCT p.instruksi_id) FILTER (WHERE ik.aktif = true) = 0 THEN 'belum_mulai'
        WHEN COUNT(DISTINCT p.instruksi_id) FILTER (WHERE ik.aktif = true) = COUNT(DISTINCT ik.id) FILTER (WHERE ik.aktif = true) THEN 'lulus'
        ELSE 'proses'
    END AS status,
    MAX(p.dinilai_at) FILTER (WHERE ik.aktif = true) AS tanggal_lulus,
    MAX(p.dinilai_at) AS terakhir_dinilai_at,
    (SELECT nama FROM public.profiles WHERE id = (
        SELECT dinilai_oleh FROM public.penilaian 
        WHERE siswa_id = s.id 
          AND instruksi_id IN (SELECT id FROM public.instruksi_kerja WHERE skill_check_id = sc.id AND aktif = true)
        ORDER BY dinilai_at DESC LIMIT 1
    )) AS terakhir_dinilai_oleh
FROM
    public.siswa s
    LEFT JOIN public.rombel r ON s.rombel_id = r.id
    CROSS JOIN public.skill_check sc
    LEFT JOIN public.instruksi_kerja ik ON sc.id = ik.skill_check_id
    LEFT JOIN public.penilaian p ON s.id = p.siswa_id AND ik.id = p.instruksi_id
WHERE
    s.aktif = true AND sc.aktif = true
GROUP BY
    s.id, s.nis, s.nama, r.id, r.nama, sc.id, sc.kode, sc.nama;

-- ============================================================================
-- 4. TRIGGER: Auto-create profile with role='pending' on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, role, aktif)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        'pending',
        true
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. TRIGGER: Enforce dinilai_oleh = auth.uid() on penilaian insert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_dinilai_oleh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.dinilai_oleh = auth.uid();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_dinilai_oleh_insert ON public.penilaian;
CREATE TRIGGER enforce_dinilai_oleh_insert
BEFORE INSERT ON public.penilaian
FOR EACH ROW
EXECUTE FUNCTION public.enforce_dinilai_oleh();

-- ============================================================================
-- 6. TRIGGER: Log penilaian after insert/delete
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_penilaian_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_skill_check_id UUID;
BEGIN
    SELECT skill_check_id INTO v_skill_check_id
    FROM public.instruksi_kerja
    WHERE id = NEW.instruksi_id;

    INSERT INTO public.log_aktivitas (guru_id, siswa_id, skill_check_id, instruksi_id, aksi)
    VALUES (NEW.dinilai_oleh, NEW.siswa_id, v_skill_check_id, NEW.instruksi_id, 'centang');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_penilaian_after_insert ON public.penilaian;
CREATE TRIGGER log_penilaian_after_insert
AFTER INSERT ON public.penilaian
FOR EACH ROW
EXECUTE FUNCTION public.log_penilaian_after_insert();

CREATE OR REPLACE FUNCTION public.log_penilaian_after_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_skill_check_id UUID;
BEGIN
    SELECT skill_check_id INTO v_skill_check_id
    FROM public.instruksi_kerja
    WHERE id = OLD.instruksi_id;

    INSERT INTO public.log_aktivitas (guru_id, siswa_id, skill_check_id, instruksi_id, aksi)
    VALUES (OLD.dinilai_oleh, OLD.siswa_id, v_skill_check_id, OLD.instruksi_id, 'batal');
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS log_penilaian_after_delete ON public.penilaian;
CREATE TRIGGER log_penilaian_after_delete
AFTER DELETE ON public.penilaian
FOR EACH ROW
EXECUTE FUNCTION public.log_penilaian_after_delete();

-- ============================================================================
-- 7. FUNCTION: reset_skill_check (requires guru or admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_skill_check(
    p_siswa UUID,
    p_skill UUID,
    p_alasan TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_guru_id UUID;
BEGIN
    v_guru_id = auth.uid();
    
    -- Check if caller is guru or admin
    IF NOT (SELECT is_guru()) THEN
        RAISE EXCEPTION 'Only guru or admin can reset skill check';
    END IF;
    
    -- Log the reset action
    INSERT INTO public.log_aktivitas (guru_id, siswa_id, skill_check_id, aksi, alasan)
    VALUES (v_guru_id, p_siswa, p_skill, 'reset', p_alasan);
    
    -- Delete all penilaian for this siswa × skill_check
    DELETE FROM public.penilaian
    WHERE siswa_id = p_siswa
      AND instruksi_id IN (
        SELECT id FROM public.instruksi_kerja WHERE skill_check_id = p_skill
      );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reset_skill_check FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reset_skill_check TO authenticated;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rombel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_check ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruksi_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Profiles: Guru/Admin read all; only admin can update role/aktif
CREATE POLICY profiles_read_for_auth ON public.profiles
    FOR SELECT
    USING (is_guru());

CREATE POLICY profiles_update_name_for_self ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY profiles_update_role_for_admin ON public.profiles
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Rombel: Guru/Admin read and write
CREATE POLICY rombel_read_for_guru ON public.rombel
    FOR SELECT
    USING (is_guru());

CREATE POLICY rombel_write_for_guru ON public.rombel
    FOR INSERT
    WITH CHECK (is_guru());

CREATE POLICY rombel_update_for_guru ON public.rombel
    FOR UPDATE
    USING (is_guru())
    WITH CHECK (is_guru());

-- Siswa: Guru/Admin read and write
CREATE POLICY siswa_read_for_guru ON public.siswa
    FOR SELECT
    USING (is_guru());

CREATE POLICY siswa_write_for_guru ON public.siswa
    FOR INSERT
    WITH CHECK (is_guru());

CREATE POLICY siswa_update_for_guru ON public.siswa
    FOR UPDATE
    USING (is_guru())
    WITH CHECK (is_guru());

-- Skill Check: Guru/Admin read and write
CREATE POLICY skill_check_read_for_guru ON public.skill_check
    FOR SELECT
    USING (is_guru());

CREATE POLICY skill_check_write_for_guru ON public.skill_check
    FOR INSERT
    WITH CHECK (is_guru());

CREATE POLICY skill_check_update_for_guru ON public.skill_check
    FOR UPDATE
    USING (is_guru())
    WITH CHECK (is_guru());

-- Instruksi Kerja: Guru/Admin read and write
CREATE POLICY instruksi_kerja_read_for_guru ON public.instruksi_kerja
    FOR SELECT
    USING (is_guru());

CREATE POLICY instruksi_kerja_write_for_guru ON public.instruksi_kerja
    FOR INSERT
    WITH CHECK (is_guru());

CREATE POLICY instruksi_kerja_update_for_guru ON public.instruksi_kerja
    FOR UPDATE
    USING (is_guru())
    WITH CHECK (is_guru());

-- Penilaian: Guru/Admin read; only guru/admin can insert/delete
CREATE POLICY penilaian_read_for_guru ON public.penilaian
    FOR SELECT
    USING (is_guru());

CREATE POLICY penilaian_insert_for_guru ON public.penilaian
    FOR INSERT
    WITH CHECK (is_guru());

CREATE POLICY penilaian_delete_for_guru ON public.penilaian
    FOR DELETE
    USING (is_guru());

-- Log Aktivitas: Guru/Admin read only; no direct write/delete
CREATE POLICY log_aktivitas_read_for_guru ON public.log_aktivitas
    FOR SELECT
    USING (is_guru());