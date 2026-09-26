-- Seed data: 20260926000001_seed_sample_data.sql
-- Description: Sample data for development and testing

-- 1. Insert sample skills
INSERT INTO public.skills (code, title, description) VALUES
('TUNEUP', 'Tune Up Bensin', 'Perform tune-up on gasoline engine including spark plugs, timing, and fuel mixture'),
('OVERHAUL', 'Overhaul Rem', 'Complete disassembly, inspection, and reassembly of transmission'),
('STARTER', 'Sistem Starter', 'Diagnose and repair starter motor system')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert sample indicators for TUNEUP (skill_id will be looked up)
WITH skill_tuneup AS (SELECT id FROM public.skills WHERE code = 'TUNEUP' LIMIT 1)
INSERT INTO public.skill_indicators (skill_id, step_order, description, sop_standard)
SELECT id, 1, 'Lepas filter udara', 'Rujuk SOP Filter Udara' FROM skill_tuneup
UNION ALL
SELECT id, 2, 'Periksa kondisi busi', 'Rujuk SOP Busi' FROM skill_tuneup
UNION ALL
SELECT id, 3, 'Ganti busi jika perlu', 'Rujuk SOP Busi' FROM skill_tuneup
UNION ALL
SELECT id, 4, 'Setel celah elektroda', 'Rujuk SOP Busi' FROM skill_tuneup
UNION ALL
SELECT id, 5, 'Pasang kembali filter udara', 'Rujuk SOP Filter Udara' FROM skill_tuneup;

-- 3. Insert sample indicators for OVERHAUL
WITH skill_overhaul AS (SELECT id FROM public.skills WHERE code = 'OVERHAUL' LIMIT 1)
INSERT INTO public.skill_indicators (skill_id, step_order, description, sop_standard)
SELECT id, 1, 'Lepas minyak transmisi', 'Rujuk SOP Minyak Transmisi' FROM skill_overhaul
UNION ALL
SELECT id, 2, 'Buka casing transmisi', 'Rujuk SOP Casing' FROM skill_overhaul
UNION ALL
SELECT id, 3, 'Periksa kondisi gear dan bearing', 'Rujuk SOP Gear Bearing' FROM skill_overhaul
UNION ALL
SELECT id, 4, 'Ganti seal yang bocor', 'Rujuk SOP Seal' FROM skill_overhaul
UNION ALL
SELECT id, 5, 'Pasang kembali casing dan isi minyak baru', 'Rujuk SOP Minyak Transmisi' FROM skill_overhaul;

-- 4. Insert sample indicators for STARTER
WITH skill_starter AS (SELECT id FROM public.skills WHERE code = 'STARTER' LIMIT 1)
INSERT INTO public.skill_indicators (skill_id, step_order, description, sop_standard)
SELECT id, 1, 'Periksa koneksi aki ke starter', 'Rujuk SOP Aki' FROM skill_starter
UNION ALL
SELECT id, 2, 'Uji tegangan saat kontak aktif', 'Rujuk SOP Tegangan' FROM skill_starter
UNION ALL
SELECT id, 3, 'Periksa kondisi pinion gear', 'Rujuk SOP Pinion' FROM skill_starter
UNION ALL
SELECT id, 4, 'Periksa kommutator dan brush', 'Rujuk SOP Kommutator Brush' FROM skill_starter
UNION ALL
SELECT id, 5, 'Ganti starter jika rusak total', 'Rujuk SOP Penggantian' FROM skill_starter;

-- 5. Insert sample students
INSERT INTO public.students (nis, name, class, department) VALUES
('2022001', 'Aditya Wijaya', 'XII TKR A', 'Teknik Kendaraan Ringan'),
('2022002', 'Bambang Irawan', 'XII TKR A', 'Teknik Kendaraan Ringan'),
('2022003', 'Citra Lestari', 'XII TKR A', 'Teknik Kendaraan Ringan'),
('2022004', 'Dewi Sartika', 'XII TKR A', 'Teknik Kendaraan Ringan'),
('2022005', 'Eka Prasetya', 'XII TKR A', 'Teknik Kendaraan Ringan')
ON CONFLICT (nis) DO NOTHING;

-- 6. Insert sample users via auth (must be done through Supabase Auth UI or API)
-- We'll create them via Supabase Auth signup with email/password
-- Then manually set their role in profiles via SQL after they exist

-- Example: To create admin user, first signup via Auth with:
--   email: admin@skillcheck.id
--   password: rahasia123
-- Then run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '(user_id from auth)';

-- For seeding, we assume these users already exist via manual creation or separate script.
-- This seed focuses on non-auth data.

-- 7. Insert sample student_skill_status and assessment_checks for demo
-- Let's say Aditya has partially completed TUNEUP
WITH 
student_aditya AS (SELECT id FROM public.students WHERE nis = '2022001' LIMIT 1),
skill_tuneup AS (SELECT id FROM public.skills WHERE code = 'TUNEUP' LIMIT 1),
indi_1 AS (SELECT id FROM public.skill_indicators WHERE skill_id = (SELECT id FROM skill_tuneup) AND step_order = 1 LIMIT 1),
indi_2 AS (SELECT id FROM public.skill_indicators WHERE skill_id = (SELECT id FROM skill_tuneup) AND step_order = 2 LIMIT 1)
-- Simulate checked indicators 1 and 2
INSERT INTO public.assessment_checks (student_id, indicator_id, is_checked, notes)
SELECT 
    (SELECT id FROM student_aditya),
    (SELECT id FROM indi_1),
    TRUE,
    'Busi sudah diganti 2 bulan lalu'
ON CONFLICT (student_id, indicator_id) DO UPDATE SET
    is_checked = EXCLUDED.is_checked,
    notes = EXCLUDED.notes,
    updated_at = NOW();

INSERT INTO public.assessment_checks (student_id, indicator_id, is_checked, notes)
SELECT 
    (SELECT id FROM student_aditya),
    (SELECT id FROM indi_2),
    TRUE,
    NULL
ON CONFLICT (student_id, indicator_id) DO UPDATE SET
    is_checked = EXCLUDED.is_checked,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- The trigger will automatically update student_skill_status based on these checks