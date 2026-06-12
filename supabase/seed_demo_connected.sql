-- ===================================================================
-- SEED: Demo Connected Data for SCIDAS �€” Production Demo
-- ===================================================================
-- �Ÿ”� วิ�˜ี�ƒ�Š�‰: รั�™�ƒ�™ Supabase SQL Editor (�ƒ�Š�‰ service_role อั�•�‚�™มั�•ิ)
--
-- �Ÿ”‘ ก�ˆอ�™รั�™: �€�›ลี�ˆย�™ UUID placeholder �”�‰า�™ล�ˆา�‡�€�›�‡�™ auth.users.id �‚อ�‡�„ุ�“
--    SELECT id, email FROM auth.users;  �†’  �„ั�”ลอก UUID
--    �€�›ิ�” find-and-replace �—ั�‰�‡�„�Ÿล�Œ:
--      หา:   4040cb4e-6c18-41aa-b2dc-73f63103e52e
--      แ�—�™:  <auth.users.id �‚อ�‡�„ุ�“>
--
-- �š�️  �–�‰ายั�‡�„ม�ˆมี auth.users �ƒห�‰สร�‰า�‡�œ�ˆา�™ Supabase Auth UI ก�ˆอ�™
--
-- �™�️  Idempotent: รั�™�‹�‰ำ�„�”�‰ �ƒ�Š�‰ ON CONFLICT DO NOTHING
-- ===================================================================

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 1. SCHOOL
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- Clean up the earlier standalone demo-school seed if it was run partially.
-- The active seed below uses the existing school_id attached to amin@rpg41.ac.th.
DELETE FROM schools
WHERE id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO schools (id, name, school_code, address, district, province, phone, is_active)
VALUES (
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  '�‚ร�‡�€รีย�™�š�‰า�™ห�™อ�‡แ�„',
  'SCH1001',
  '123 หมู�ˆ 4 �•ำ�šลห�™อ�‡แ�„ อำ�€ภอแก�‰�‡�„ร�‰อ',
  'แก�‰�‡�„ร�‰อ',
  '�Šัยภูมิ',
  '044-123456',
  true
)
ON CONFLICT DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 2. ACADEMIC YEAR + SEMESTERS
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
INSERT INTO academic_years (id, school_id, year, start_date, end_date, is_current)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  2567,
  '2024-05-16',
  '2025-03-31',
  false
)
ON CONFLICT DO NOTHING;

INSERT INTO semesters (id, school_id, academic_year_id, semester, start_date, end_date, is_current)
VALUES
  ('b1000000-0000-0000-0000-000000000001', '45ef7b2c-5be1-4774-8f46-d1035fe3151e', 'b0000000-0000-0000-0000-000000000001', 'semester_1', '2024-05-16', '2024-10-15', true),
  ('b1000000-0000-0000-0000-000000000002', '45ef7b2c-5be1-4774-8f46-d1035fe3151e', 'b0000000-0000-0000-0000-000000000001', 'semester_2', '2024-10-16', '2025-03-31', false)
ON CONFLICT (academic_year_id, semester) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 3. DEMO ADMIN PROFILE
-- �€�›ลี�ˆย�™ 4040cb4e-6c18-41aa-b2dc-73f63103e52e �€�›�‡�™ auth.users.id �ˆริ�‡
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
INSERT INTO profiles (id, school_id, role, prefix, first_name, last_name, position, is_active)
VALUES (
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  'admin',
  '�™า�‡สาว',
  '�ˆั�™�—ร�Œ�ˆิรา',
  '�žรม�”ี',
  '�œู�‰�”ูแลระ�š�š',
  true
)
ON CONFLICT (id) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 4. STUDENTS �€” 45 �„�™ ระ�”ั�š �›.4-ม.3
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
INSERT INTO students (id, school_id, student_code, prefix, first_name, last_name, nickname, gender, date_of_birth, status, enrollment_date)
VALUES
  ('c1000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3001','�€�”�‡ก�Šาย','�˜�™วั�’�™�Œ','�ƒ�ˆ�”ี','วั�’�™�Œ','male','2009-05-10','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3002','�€�”�‡กหญิ�‡','�žร�žิมล','ศรี�—อ�‡','�žิม','female','2009-03-15','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3003','�€�”�‡ก�Šาย','�ˆิรายุ','ภัก�”ี','ยุ','male','2009-07-22','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3004','�€�”�‡กหญิ�‡','ศิริกัญญา','�ƒ�ˆรักษ�Œ','กัญญา','female','2009-01-08','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3005','�€�”�‡ก�Šาย','กฤษ�“ะ','�žู�™�—รั�žย�Œ','�“ะ','male','2009-11-30','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3006','�€�”�‡กหญิ�‡','ก�™กวรร�“','มีสุ�‚','�™ก','female','2009-09-14','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3007','�€�”�‡ก�Šาย','�žีร�žล','�Š�ˆา�‡�„ิ�”','�žล','male','2008-12-05','active','2024-05-16'),
  ('c1000000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M3008','�€�”�‡กหญิ�‡','วิภา�”า','แส�™�”ี','ภา','female','2009-04-18','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2001','�€�”�‡ก�Šาย','สม�Šาย','รัก�€รีย�™','�Šาย','male','2010-06-20','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2002','�€�”�‡กหญิ�‡','สมศรี','�•ั�‰�‡�ƒ�ˆ','ศรี','female','2010-02-14','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2003','�€�”�‡ก�Šาย','�€อกภ�ž','�—อ�‡แ�—�‰','�€อก','male','2010-08-30','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2004','�€�”�‡กหญิ�‡','ญา�”า','�€�ž�Šร�”ี','�”า','female','2010-11-12','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2005','�€�”�‡ก�Šาย','�ž�‡ศกร','�„�Šยมั�ˆ�™','กร','male','2010-03-25','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2006','�€�”�‡กหญิ�‡','�›ภัสสร','อำ�™า�ˆแย�‰ม','สร','female','2010-07-08','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2007','�€�”�‡ก�Šาย','กฤษ�Žา','แส�™กล�‰า','�”ำ','male','2010-01-19','active','2024-05-16'),
  ('c2000000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M2008','�€�”�‡กหญิ�‡','อริสรา','�„ำ�”ี','ออย','female','2010-10-05','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1001','�€�”�‡ก�Šาย','ศุภ�Šัย','มี�—รั�žย�Œ','�Šัย','male','2011-04-12','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1002','�€�”�‡กหญิ�‡','วริศรา','�šุญมา','ริ','female','2011-08-22','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1003','�€�”�‡ก�Šาย','�ž�™มภั�—ร','รักษ�Œมั�ˆ�™�„�‡','ภั�—ร','male','2011-01-30','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1004','�€�”�‡กหญิ�‡','สุ�Šา�”า','แก�‰ว�ƒส','�”า','female','2011-06-15','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1005','�€�”�‡ก�Šาย','�˜�™ากร','แส�‡�—อ�‡','กร','male','2011-09-28','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1006','�€�”�‡กหญิ�‡','�™ั�™�—�žร','ว�‡ศ�Œ�ƒหญ�ˆ','�žร','female','2011-03-07','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1007','�€�”�‡ก�Šาย','อภิ�Šา�•ิ','�”ำร�‡�„�Œ','�Šา�•ิ','male','2011-11-14','active','2024-05-16'),
  ('c3000000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','M1008','�€�”�‡กหญิ�‡','�€กศริ�™','สุ�‚�ƒ�ˆ','�€กศ','female','2011-05-20','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6001','�€�”�‡ก�Šาย','วีร�ž�‡ษ�Œ','�Šัย�Š�™ะ','�ž�‡ษ�Œ','male','2012-02-10','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6002','�€�”�‡กหญิ�‡','รั�•�™า','�—อ�‡�”ี','�™า','female','2012-07-18','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6003','�€�”�‡ก�Šาย','สม�šั�•ิ','มั�ˆ�‡มี','�šั�•ิ','male','2012-04-25','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6004','�€�”�‡กหญิ�‡','อรุ�“ี','แส�‡�ˆั�™�—ร�Œ','รุ�‰�‡','female','2012-09-08','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6005','�€�”�‡ก�Šาย','�“ัฐวุ�’ิ','�„�‡กระ�žั�™','วุ�’ิ','male','2012-01-30','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6006','�€�”�‡กหญิ�‡','�žิมลรั�•�™�Œ','สุ�‚ส�šาย','�žิม','female','2012-06-14','active','2024-05-16'),
  ('c4000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P6007','�€�”�‡ก�Šาย','ภา�“ุวั�’�™�Œ','ฤ�—�˜ิ�Œ�€�”�Š','วั�’�™�Œ','male','2012-12-03','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5001','�€�”�‡ก�Šาย','ก�‰อ�‡ภ�ž','�ƒ�ˆ�€�ž�Šร','ก�‰อ�‡','male','2013-03-15','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5002','�€�”�‡กหญิ�‡','�™ภัสสร','ศรีวิ�„ล','�™ภ','female','2013-08-22','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5003','�€�”�‡ก�Šาย','�€�ˆษ�Žา','�šุญ�€สริม','�€�ˆ','male','2013-05-10','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5004','�€�”�‡กหญิ�‡','วรร�“วิสา','�‚�Š�•ิ�Š�ˆว�‡','วิ','female','2013-11-28','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5005','�€�”�‡ก�Šาย','�˜ีร�€�”�Š','�€ม�•�•า','�€�”�Š','male','2013-01-07','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5006','�€�”�‡กหญิ�‡','กาญ�ˆ�™า','�žิ�—ักษ�Œ','�ˆ�™า','female','2013-07-19','active','2024-05-16'),
  ('c5000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P5007','�€�”�‡ก�Šาย','สิรภ�ž','มั�ˆ�™ยื�™','ภ�ž','male','2013-04-02','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4001','�€�”�‡ก�Šาย','�ˆักร�ž�‡ษ�Œ','�€รือ�‡รอ�‡','�ˆักร','male','2014-09-11','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4002','�€�”�‡กหญิ�‡','ศรัญญา','แก�‰วกาญ�ˆ�™�Œ','ศร','female','2014-02-25','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4003','�€�”�‡ก�Šาย','วร�€�Šษฐ�Œ','�„�‡�„า','�€�Šษฐ�Œ','male','2014-06-18','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4004','�€�”�‡กหญิ�‡','สุ�—�˜ิ�”า','สาย�—อ�‡','�•�‰า','female','2014-12-08','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4005','�€�”�‡ก�Šาย','�›ริญญา','วิ�Šัย','�›ริญ','male','2014-03-30','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4006','�€�”�‡กหญิ�‡','�›วี�“า','�™วล�ˆั�™�—ร�Œ','�›วี','female','2014-10-15','active','2024-05-16'),
  ('c6000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','P4007','�€�”�‡ก�Šาย','�“ร�‡�„�Œฤ�—�˜ิ�Œ','อิ�™�—ร�Œ','�“ร�‡�„�Œ','male','2014-05-22','active','2024-05-16')
ON CONFLICT (school_id, student_code) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 5. GUARDIANS + STUDENT_GUARDIANS
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
INSERT INTO guardians (id, school_id, prefix, first_name, last_name, phone, occupation)
VALUES
  ('d0000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™าย','สม�Šาย','�ƒ�ˆ�”ี','0811110001','�€กษ�•รกร'),
  ('d0000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™า�‡','สมหญิ�‡','�ƒ�ˆ�”ี','0811110002','แม�ˆ�š�‰า�™'),
  ('d0000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™าย','�›ระสิ�—�˜ิ�Œ','ศรี�—อ�‡','0812220001','รั�š�ˆ�‰า�‡'),
  ('d0000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™า�‡','�šัวลอย','ภัก�”ี','0813330001','�„�‰า�‚าย'),
  ('d0000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™าย','ม�™�•รี','�ƒ�ˆรักษ�Œ','0814440001','�‚�‰ารา�Šการ'),
  ('d0000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™า�‡','ลำ�”ว�™','�žู�™�—รั�žย�Œ','0815550001','�€กษ�•รกร'),
  ('d0000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™าย','สมศัก�”ิ�Œ','มีสุ�‚','0816660001','รั�š�ˆ�‰า�‡'),
  ('d0000000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™า�‡','�—อ�‡�ƒ�š','�Š�ˆา�‡�„ิ�”','0817770001','�„�‰า�‚าย'),
  ('d0000000-0000-0000-0000-000000000009','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™าย','�šุญมี','แส�™�”ี','0818880001','�€กษ�•รกร'),
  ('d0000000-0000-0000-0000-00000000000a','45ef7b2c-5be1-4774-8f46-d1035fe3151e','�™า�‡','�ˆั�™�—ร�Œ�€�ž�‡ญ','รัก�€รีย�™','0819990001','แม�ˆ�š�‰า�™')
ON CONFLICT DO NOTHING;

INSERT INTO student_guardians (id, school_id, student_id, guardian_id, relation, is_primary, is_emergency_contact)
VALUES
  ('e0000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','father',true,true),
  ('e0000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003','father',true,true),
  ('e0000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000004','mother',true,true),
  ('e0000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000005','father',true,true),
  ('e0000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000006','mother',true,true),
  ('e0000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000006','d0000000-0000-0000-0000-000000000007','father',true,true),
  ('e0000000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000007','d0000000-0000-0000-0000-000000000008','mother',true,true),
  ('e0000000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c1000000-0000-0000-0000-000000000008','d0000000-0000-0000-0000-000000000009','father',true,true),
  ('e0000000-0000-0000-0000-000000000009','45ef7b2c-5be1-4774-8f46-d1035fe3151e','c2000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-00000000000a','mother',true,true)
ON CONFLICT (student_id, guardian_id) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 6. CLASSROOMS + ENROLLMENT
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
INSERT INTO classrooms (id, school_id, academic_year_id, grade_level, section, name, max_students, is_active)
VALUES
  ('f0000000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','m3',1,'ม.3/1',40,true),
  ('f0000000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','m2',1,'ม.2/1',40,true),
  ('f0000000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','m1',1,'ม.1/1',40,true),
  ('f0000000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','p6',1,'�›.6/1',30,true),
  ('f0000000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','p5',1,'�›.5/1',30,true),
  ('f0000000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','b0000000-0000-0000-0000-000000000001','p4',1,'�›.4/1',30,true)
ON CONFLICT (academic_year_id, grade_level, section) DO NOTHING;

-- Enroll students into classrooms by grade level prefix
INSERT INTO classroom_students (id, school_id, classroom_id, student_id, semester_id, student_number, is_active)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  cls.id,
  s.id,
  'b1000000-0000-0000-0000-000000000001',
  ROW_NUMBER() OVER (PARTITION BY cls.id ORDER BY s.student_code),
  true
FROM students s
JOIN classrooms cls ON
  (s.student_code LIKE 'M3%' AND cls.grade_level = 'm3') OR
  (s.student_code LIKE 'M2%' AND cls.grade_level = 'm2') OR
  (s.student_code LIKE 'M1%' AND cls.grade_level = 'm1') OR
  (s.student_code LIKE 'P6%' AND cls.grade_level = 'p6') OR
  (s.student_code LIKE 'P5%' AND cls.grade_level = 'p5') OR
  (s.student_code LIKE 'P4%' AND cls.grade_level = 'p4')
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ON CONFLICT (student_id, semester_id) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- 7-17: �‚�‰อมูล�—ี�ˆอ�‰า�‡อิ�‡ admin profile (4040cb4e-6c18-41aa-b2dc-73f63103e52e)
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�

-- SUBJECTS (10 วิ�Šา)
INSERT INTO subjects (id, school_id, subject_code, name, learning_area, credit)
VALUES
  ('a0100000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','TH101','ภาษา�„�—ย','ภาษา�„�—ย',1.5),
  ('a0100000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','MA101','�„�“ิ�•ศาส�•ร�Œ','�„�“ิ�•ศาส�•ร�Œ',1.5),
  ('a0100000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','SC101','วิ�—ยาศาส�•ร�Œ','วิ�—ยาศาส�•ร�Œ',1.5),
  ('a0100000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','EN101','ภาษาอั�‡กฤษ','ภาษา�•�ˆา�‡�›ระ�€�—ศ',1.0),
  ('a0100000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','SS101','สั�‡�„มศึกษา','สั�‡�„มศึกษา',1.0),
  ('a0100000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','PE101','สุ�‚ศึกษาและ�žลศึกษา','สุ�‚ศึกษา',0.5),
  ('a0100000-0000-0000-0000-000000000007','45ef7b2c-5be1-4774-8f46-d1035fe3151e','AR101','ศิล�›ะ','ศิล�›ะ',0.5),
  ('a0100000-0000-0000-0000-000000000008','45ef7b2c-5be1-4774-8f46-d1035fe3151e','CT101','การ�‡า�™อา�Šี�ž','การ�‡า�™อา�Šี�ž',0.5),
  ('a0100000-0000-0000-0000-000000000009','45ef7b2c-5be1-4774-8f46-d1035fe3151e','CS101','�„อม�žิว�€�•อร�Œ','วิ�—ยาศาส�•ร�Œ',0.5),
  ('a0100000-0000-0000-0000-00000000000a','45ef7b2c-5be1-4774-8f46-d1035fe3151e','HI101','�›ระวั�•ิศาส�•ร�Œ','สั�‡�„มศึกษา',0.5)
ON CONFLICT (school_id, subject_code) DO NOTHING;

-- CLASSROOM_SUBJECTS �€” top 5 subjects per classroom, admin as teacher
INSERT INTO classroom_subjects (id, school_id, classroom_id, subject_id, teacher_id, semester_id)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  c.id,
  s.id,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  'b1000000-0000-0000-0000-000000000001'
FROM classrooms c
CROSS JOIN subjects s
WHERE c.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND s.subject_code IN ('TH101','MA101','SC101','EN101','SS101')
ON CONFLICT (classroom_id, subject_id, semester_id) DO NOTHING;

-- ATTENDANCE �€” 3 dates, all students
INSERT INTO attendance_records (id, school_id, student_id, classroom_id, date, status, check_in_time, recorded_by)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  cs.student_id,
  cs.classroom_id,
  d.date,
  CASE WHEN random() < 0.85 THEN 'present'::attendance_status
       WHEN random() < 0.92 THEN 'late'::attendance_status
       ELSE 'absent'::attendance_status END,
  CASE WHEN random() < 0.85 THEN ('07:' || LPAD((40 + floor(random()*20))::text, 2, '0') || ':00')::time ELSE NULL END,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e'
FROM classroom_students cs
CROSS JOIN (VALUES (CURRENT_DATE - 2), (CURRENT_DATE - 1), (CURRENT_DATE)) AS d(date)
WHERE cs.semester_id = 'b1000000-0000-0000-0000-000000000001'
ON CONFLICT (student_id, classroom_id, date) DO NOTHING;

-- ACADEMIC SCORES
INSERT INTO academic_scores (id, school_id, student_id, classroom_subject_id, semester_id, midterm_score, final_score, classwork_score)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  cs.student_id,
  csub.id,
  'b1000000-0000-0000-0000-000000000001',
  LEAST(20, GREATEST(0, 10 + floor(random()*12)))::numeric(5,2),
  LEAST(20, GREATEST(0, 10 + floor(random()*12)))::numeric(5,2),
  LEAST(60, GREATEST(0, 30 + floor(random()*35)))::numeric(5,2)
FROM classroom_students cs
JOIN classrooms c ON c.id = cs.classroom_id
JOIN classroom_subjects csub ON csub.classroom_id = c.id
WHERE cs.semester_id = 'b1000000-0000-0000-0000-000000000001'
ON CONFLICT (student_id, classroom_subject_id, semester_id) DO NOTHING;

-- BEHAVIOR RECORDS �€” 80 records
INSERT INTO behavior_records (id, school_id, student_id, date, behavior_type, category, description, points, reported_by)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-behavior-' || s.id::text || '-' || gs.n::text),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  s.id,
  CURRENT_DATE - ((gs.n * 7 + ROW_NUMBER() OVER (ORDER BY s.student_code, gs.n)) % 30)::int,
  CASE WHEN random() < 0.6 THEN 'positive'::behavior_type WHEN random() < 0.85 THEN 'negative'::behavior_type ELSE 'neutral'::behavior_type END,
  CASE WHEN random() < 0.33 THEN 'การ�€รีย�™' WHEN random() < 0.66 THEN '�„วาม�›ระ�žฤ�•ิ' ELSE 'กิ�ˆกรรม' END,
  CASE WHEN random() < 0.5 THEN '�•ั�‰�‡�ƒ�ˆ�€รีย�™และมีส�ˆว�™ร�ˆวม�ƒ�™�Šั�‰�™�€รีย�™' ELSE '�Š�ˆวย�€หลือ�€�žื�ˆอ�™และ�„รูอย�ˆา�‡สม�ˆำ�€สมอ' END,
  CASE WHEN random() < 0.6 THEN 2 ELSE -1 END,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e'
FROM students s
CROSS JOIN generate_series(1, 2) AS gs(n)
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ORDER BY s.student_code, gs.n
LIMIT 80
ON CONFLICT (id) DO NOTHING;

-- RISK ASSESSMENTS
INSERT INTO risk_assessments (id, school_id, student_id, semester_id, risk_score, risk_level, assessed_by, assessed_at, recommendations)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  s.id,
  'b1000000-0000-0000-0000-000000000001',
  LEAST(100, GREATEST(0, floor(random()*70)))::int,
  CASE WHEN random() < 0.15 THEN 'high'::risk_level WHEN random() < 0.40 THEN 'watch'::risk_level ELSE 'normal'::risk_level END,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  CURRENT_TIMESTAMP - (random()*30 || ' days')::interval,
  '�•ิ�”�•ามการมา�€รีย�™และ�œลการ�€รีย�™อย�ˆา�‡�ƒกล�‰�Šิ�”'
FROM students s
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ON CONFLICT (student_id, semester_id) DO NOTHING;

-- RISK FACTORS �€” for high/watch students only
INSERT INTO risk_factors (id, school_id, risk_assessment_id, factor_key, factor_label, score)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  ra.id,
  'frequent_absences',
  '�‚า�”�€รีย�™�š�ˆอย',
  LEAST(40, GREATEST(0, floor(random()*30)))::int
FROM risk_assessments ra
WHERE ra.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND ra.risk_level IN ('high','watch')
  AND NOT EXISTS (SELECT 1 FROM risk_factors rf WHERE rf.risk_assessment_id = ra.id AND rf.factor_key = 'frequent_absences');

INSERT INTO risk_factors (id, school_id, risk_assessment_id, factor_key, factor_label, score)
SELECT
  gen_random_uuid(),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  ra.id,
  'low_grades',
  '�œลการ�€รีย�™�•�ˆำ',
  LEAST(40, GREATEST(0, floor(random()*30)))::int
FROM risk_assessments ra
WHERE ra.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND ra.risk_level IN ('high','watch')
  AND NOT EXISTS (SELECT 1 FROM risk_factors rf WHERE rf.risk_assessment_id = ra.id AND rf.factor_key = 'low_grades');

-- SUPPORT RECORDS �€” 12 records
INSERT INTO support_records (id, school_id, student_id, semester_id, support_type, title, description, status, priority, provided_by)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-support-' || s.id::text),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  s.id,
  'b1000000-0000-0000-0000-000000000001',
  'academic'::support_type,
  '�Š�ˆวย�€หลือ�”�‰า�™การ�€รีย�™',
  '�™ัก�€รีย�™�•�‰อ�‡การ�„วาม�Š�ˆวย�€หลือ�€�žิ�ˆม�€�•ิม',
  CASE WHEN random() < 0.5 THEN 'in_progress'::support_status ELSE 'pending'::support_status END,
  'medium'::severity_level,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e'
FROM students s
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ORDER BY s.student_code
LIMIT 12
ON CONFLICT (id) DO NOTHING;

-- DEVELOPMENT PLANS �€” for high/watch risk students
INSERT INTO development_plans (id, school_id, student_id, semester_id, title, description, start_date, end_date, status, created_by, risk_assessment_id)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-plan-' || ra.id::text),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  ra.student_id,
  'b1000000-0000-0000-0000-000000000001',
  'แ�œ�™�žั�’�™า ' || s.first_name,
  'แ�œ�™�žั�’�™าราย�šุ�„�„ลสำหรั�šภา�„�€รีย�™�—ี�ˆ 1/2567',
  CURRENT_DATE,
  CURRENT_DATE + 90,
  CASE WHEN random() < 0.6 THEN 'active'::plan_status ELSE 'draft'::plan_status END,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  ra.id
FROM risk_assessments ra
JOIN students s ON s.id = ra.student_id
WHERE ra.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND ra.risk_level IN ('high','watch')
ORDER BY ra.risk_score DESC, ra.student_id
LIMIT 8
ON CONFLICT (id) DO NOTHING;

-- DEVELOPMENT GOALS �€” 1 per plan
INSERT INTO development_goals (id, school_id, plan_id, goal_number, title, description, category, status, target_date)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-goal-' || dp.id::text || '-1'),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  dp.id,
  1,
  '�›รั�š�›รุ�‡การมา�€รีย�™',
  '�€�žิ�ˆมอั�•ราการมา�€รีย�™�ƒห�‰สู�‡กว�ˆา 90%',
  'attendance',
  'in_progress'::goal_status,
  CURRENT_DATE + 60
FROM development_plans dp
WHERE dp.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ON CONFLICT (id) DO NOTHING;

-- HOME VISITS �€” 15 records
INSERT INTO home_visits (id, school_id, student_id, semester_id, visit_date, visitor_id, housing_condition, follow_up_needed, overall_assessment)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-home-visit-' || s.id::text),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  s.id,
  'b1000000-0000-0000-0000-000000000001',
  CURRENT_DATE - (floor(random()*60))::int,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  CASE WHEN random() < 0.4 THEN 'good'::housing_condition WHEN random() < 0.8 THEN 'moderate'::housing_condition ELSE 'poor'::housing_condition END,
  random() < 0.3,
  '�š�‰า�™อยู�ˆ�ƒ�™สภา�ž' || CASE WHEN random() < 0.5 THEN '�”ี' ELSE '�žอ�ƒ�Š�‰' END
FROM students s
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ORDER BY s.student_code
LIMIT 15
ON CONFLICT (id) DO NOTHING;

-- REPORT JOBS �€” 5 jobs, all statuses
INSERT INTO report_jobs (id, school_id, requested_by, report_type, title, status, filters)
VALUES
  ('dead0000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','student_summary','ราย�‡า�™สรุ�›�™ัก�€รีย�™','completed','{}'::jsonb),
  ('dead0000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','risk_report','ราย�‡า�™กลุ�ˆม�€สี�ˆย�‡','completed','{}'::jsonb),
  ('dead0000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','attendance_report','ราย�‡า�™การมา�€รีย�™','queued','{}'::jsonb),
  ('dead0000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','behavior_report','ราย�‡า�™�žฤ�•ิกรรม','failed','{}'::jsonb),
  ('dead0000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','academic_report','ราย�‡า�™�œลการ�€รีย�™','running','{}'::jsonb)
ON CONFLICT DO NOTHING;

-- NOTIFICATIONS �€” 2 unread + 4 read, all to admin
INSERT INTO notifications (id, school_id, recipient_id, sender_id, type, title, message, is_read)
VALUES
  ('deaf0000-0000-0000-0000-000000000001','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','risk_alert','�™ัก�€รีย�™กลุ�ˆม�€สี�ˆย�‡สู�‡','มี�™ัก�€รีย�™�—ี�ˆ�„ะแ�™�™�„วาม�€สี�ˆย�‡�€กิ�™ 80 �ˆำ�™ว�™ 3 �„�™',false),
  ('deaf0000-0000-0000-0000-000000000002','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','attendance_alert','�™ัก�€รีย�™�‚า�”�€รีย�™','มี�™ัก�€รีย�™�‚า�”�€รีย�™�•�ˆอ�€�™ื�ˆอ�‡ 2 �„�™',false),
  ('deaf0000-0000-0000-0000-000000000003','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','behavior_alert','�žฤ�•ิกรรม�—ี�ˆ�•�‰อ�‡�•ิ�”�•าม','�™ัก�€รีย�™ ม.2/1 มี�žฤ�•ิกรรม�—ี�ˆ�•�‰อ�‡�•ิ�”�•าม',true),
  ('deaf0000-0000-0000-0000-000000000004','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','4040cb4e-6c18-41aa-b2dc-73f63103e52e','plan_review','�—�š�—ว�™แ�œ�™�žั�’�™า','�–ึ�‡�€วลา�—�š�—ว�™แ�œ�™�žั�’�™า ภา�„�€รีย�™ 1/2567',true),
  ('deaf0000-0000-0000-0000-000000000005','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e',NULL,'system','อั�›�€�”�•ระ�š�š','ระ�š�š�„�”�‰อั�›�€�”�•�‚�‰อมูล�™ัก�€รีย�™�€รีย�šร�‰อยแล�‰ว',true),
  ('deaf0000-0000-0000-0000-000000000006','45ef7b2c-5be1-4774-8f46-d1035fe3151e','4040cb4e-6c18-41aa-b2dc-73f63103e52e',NULL,'general','ยิ�™�”ี�•�‰อ�™รั�š','ยิ�™�”ี�•�‰อ�™รั�š�€�‚�‰าสู�ˆระ�š�š SCIDAS',true)
ON CONFLICT DO NOTHING;

-- STUDENT NOTES
INSERT INTO student_notes (id, school_id, student_id, author_id, category, body, visibility)
SELECT
  uuid_generate_v5('11111111-1111-1111-1111-111111111111'::uuid, 'demo-note-' || s.id::text),
  '45ef7b2c-5be1-4774-8f46-d1035fe3151e',
  s.id,
  '4040cb4e-6c18-41aa-b2dc-73f63103e52e',
  'general',
  '�šั�™�—ึกการ�•ิ�”�•าม: ' || s.first_name || ' มี�žั�’�™าการ�—ี�ˆ�”ี�‚ึ�‰�™�ƒ�™�”�‰า�™การ�€รีย�™',
  'team'
FROM students s
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ORDER BY s.student_code
LIMIT 10
ON CONFLICT (id) DO NOTHING;

-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�

-- ===================================================================
-- REPAIR THAI TEXT AFTER SEED
-- ===================================================================
UPDATE schools
SET
  name = 'โรงเรียนตัวอย่าง',
  address = '123 หมู่ 4 ตำบลหนองแค อำเภอแก้งคร้อ',
  district = 'แก้งคร้อ',
  province = 'ชัยภูมิ'
WHERE id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE profiles
SET
  prefix = 'นางสาว',
  first_name = 'จันทร์จิรา',
  last_name = 'พรหมดี',
  position = 'ผู้ดูแลระบบ'
WHERE id = '4040cb4e-6c18-41aa-b2dc-73f63103e52e';

UPDATE classrooms AS c
SET name = v.name
FROM (VALUES
  ('m3'::grade_level, 'ม.3/1'),
  ('m2'::grade_level, 'ม.2/1'),
  ('m1'::grade_level, 'ม.1/1'),
  ('p6'::grade_level, 'ป.6/1'),
  ('p5'::grade_level, 'ป.5/1'),
  ('p4'::grade_level, 'ป.4/1')
) AS v(grade_level, name)
WHERE c.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND c.grade_level = v.grade_level;

UPDATE subjects AS s
SET
  name = v.name,
  learning_area = v.learning_area
FROM (VALUES
  ('TH101', 'ภาษาไทย', 'ภาษาไทย'),
  ('MA101', 'คณิตศาสตร์', 'คณิตศาสตร์'),
  ('SC101', 'วิทยาศาสตร์', 'วิทยาศาสตร์'),
  ('EN101', 'ภาษาอังกฤษ', 'ภาษาต่างประเทศ'),
  ('SS101', 'สังคมศึกษา', 'สังคมศึกษา'),
  ('PE101', 'สุขศึกษาและพลศึกษา', 'สุขศึกษา'),
  ('AR101', 'ศิลปะ', 'ศิลปะ'),
  ('CT101', 'การงานอาชีพ', 'การงานอาชีพ'),
  ('CS101', 'คอมพิวเตอร์', 'วิทยาศาสตร์'),
  ('HI101', 'ประวัติศาสตร์', 'สังคมศึกษา')
) AS v(subject_code, name, learning_area)
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND s.subject_code = v.subject_code;

UPDATE students AS s
SET
  prefix = v.prefix,
  first_name = v.first_name,
  last_name = v.last_name,
  nickname = v.nickname
FROM (VALUES
  ('M3001','เด็กชาย','ธนวัฒน์','ใจดี','วัฒน์'),
  ('M3002','เด็กหญิง','พรพิมล','ศรีทอง','พิม'),
  ('M3003','เด็กชาย','จิรายุ','ภักดี','ยุ'),
  ('M3004','เด็กหญิง','ศิริกัญญา','ใจรักษ์','กัญญา'),
  ('M3005','เด็กชาย','กฤษณะ','พูนทรัพย์','ณะ'),
  ('M3006','เด็กหญิง','กนกวรรณ','มีสุข','นก'),
  ('M3007','เด็กชาย','พีรพล','ช่างคิด','พล'),
  ('M3008','เด็กหญิง','วิภาดา','แสนดี','ภา'),
  ('M2001','เด็กชาย','สมชาย','รักเรียน','ชาย'),
  ('M2002','เด็กหญิง','สมศรี','ตั้งใจ','ศรี'),
  ('M2003','เด็กชาย','เอกภพ','ทองแท้','เอก'),
  ('M2004','เด็กหญิง','ญาดา','เพชรดี','ดา'),
  ('M2005','เด็กชาย','พงศกร','ไชยมั่น','กร'),
  ('M2006','เด็กหญิง','ปภัสสร','อำนาจแย้ม','สร'),
  ('M2007','เด็กชาย','กฤษฎา','แสนกล้า','ดำ'),
  ('M2008','เด็กหญิง','อริสรา','คำดี','ออย'),
  ('M1001','เด็กชาย','ศุภชัย','มีทรัพย์','ชัย'),
  ('M1002','เด็กหญิง','วริศรา','บุญมา','ริ'),
  ('M1003','เด็กชาย','พนมภัทร','รักษ์มั่นคง','ภัทร'),
  ('M1004','เด็กหญิง','สุชาดา','แก้วใส','ดา'),
  ('M1005','เด็กชาย','ธนากร','แสงทอง','กร'),
  ('M1006','เด็กหญิง','นันทพร','วงศ์ใหญ่','พร'),
  ('M1007','เด็กชาย','อภิชาติ','ดำรงค์','ชาติ'),
  ('M1008','เด็กหญิง','เกศริน','สุขใจ','เกศ'),
  ('P6001','เด็กชาย','วีรพงษ์','ชัยชนะ','พงษ์'),
  ('P6002','เด็กหญิง','รัตนา','ทองดี','นา'),
  ('P6003','เด็กชาย','สมบัติ','มั่งมี','บัติ'),
  ('P6004','เด็กหญิง','อรุณี','แสงจันทร์','รุ่ง'),
  ('P6005','เด็กชาย','ณัฐวุฒิ','คงกระพัน','วุฒิ'),
  ('P6006','เด็กหญิง','พิมลรัตน์','สุขสบาย','พิม'),
  ('P6007','เด็กชาย','ภาณุวัฒน์','ฤทธิ์เดช','วัฒน์'),
  ('P5001','เด็กชาย','ก้องภพ','ใจเพชร','ก้อง'),
  ('P5002','เด็กหญิง','นภัสสร','ศรีวิไล','นภ'),
  ('P5003','เด็กชาย','เจษฎา','บุญเสริม','เจ'),
  ('P5004','เด็กหญิง','วรรณวิสา','โชติช่วง','วิ'),
  ('P5005','เด็กชาย','ธีรเดช','เมตตา','เดช'),
  ('P5006','เด็กหญิง','กาญจนา','พิทักษ์','จนา'),
  ('P5007','เด็กชาย','สิรภพ','มั่นยืน','ภพ'),
  ('P4001','เด็กชาย','จักรพงษ์','เรืองรอง','จักร'),
  ('P4002','เด็กหญิง','ศรัญญา','แก้วกาญจน์','ศร'),
  ('P4003','เด็กชาย','วรเชษฐ์','คงคา','เชษฐ์'),
  ('P4004','เด็กหญิง','สุทธิดา','สายทอง','ต้า'),
  ('P4005','เด็กชาย','ปริญญา','วิชัย','ปริญ'),
  ('P4006','เด็กหญิง','ปวีณา','นวลจันทร์','ปวี'),
  ('P4007','เด็กชาย','ณรงค์ฤทธิ์','อินทร์','ณรงค์')
) AS v(student_code, prefix, first_name, last_name, nickname)
WHERE s.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND s.student_code = v.student_code;

UPDATE guardians AS g
SET
  prefix = v.prefix,
  first_name = v.first_name,
  last_name = v.last_name,
  occupation = v.occupation
FROM (VALUES
  ('d0000000-0000-0000-0000-000000000001'::uuid,'นาย','สมชาย','ใจดี','เกษตรกร'),
  ('d0000000-0000-0000-0000-000000000002'::uuid,'นาง','สมหญิง','ใจดี','แม่บ้าน'),
  ('d0000000-0000-0000-0000-000000000003'::uuid,'นาย','ประสิทธิ์','ศรีทอง','รับจ้าง'),
  ('d0000000-0000-0000-0000-000000000004'::uuid,'นาง','บัวลอย','ภักดี','ค้าขาย'),
  ('d0000000-0000-0000-0000-000000000005'::uuid,'นาย','มนตรี','ใจรักษ์','ข้าราชการ'),
  ('d0000000-0000-0000-0000-000000000006'::uuid,'นาง','ลำดวน','พูนทรัพย์','เกษตรกร'),
  ('d0000000-0000-0000-0000-000000000007'::uuid,'นาย','สมศักดิ์','มีสุข','รับจ้าง'),
  ('d0000000-0000-0000-0000-000000000008'::uuid,'นาง','ทองใบ','ช่างคิด','ค้าขาย'),
  ('d0000000-0000-0000-0000-000000000009'::uuid,'นาย','บุญมี','แสนดี','เกษตรกร'),
  ('d0000000-0000-0000-0000-00000000000a'::uuid,'นาง','จันทร์เพ็ญ','รักเรียน','แม่บ้าน')
) AS v(id, prefix, first_name, last_name, occupation)
WHERE g.id = v.id;

UPDATE behavior_records
SET
  category = CASE WHEN points >= 0 THEN 'พฤติกรรมเชิงบวก' ELSE 'พฤติกรรมที่ต้องติดตาม' END,
  description = CASE WHEN points >= 0
    THEN 'ตั้งใจเรียนและมีส่วนร่วมในชั้นเรียน'
    ELSE 'ควรติดตามพฤติกรรมและพูดคุยให้คำปรึกษา'
  END
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE risk_assessments
SET recommendations = 'ติดตามการมาเรียน ผลการเรียน และพฤติกรรมอย่างใกล้ชิด'
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE risk_factors
SET factor_label = CASE factor_key
  WHEN 'frequent_absences' THEN 'ขาดเรียนบ่อย'
  WHEN 'low_grades' THEN 'ผลการเรียนต่ำ'
  ELSE factor_label
END
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE support_records
SET
  title = 'ช่วยเหลือด้านการเรียน',
  description = 'นักเรียนต้องการความช่วยเหลือเพิ่มเติม'
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE development_plans AS dp
SET
  title = 'แผนพัฒนา ' || s.first_name,
  description = 'แผนพัฒนารายบุคคลสำหรับภาคเรียนที่ 1/2567'
FROM students s
WHERE dp.student_id = s.id
  AND dp.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE development_goals
SET
  title = 'ปรับปรุงการมาเรียน',
  description = 'เพิ่มอัตราการมาเรียนให้สูงกว่า 90%',
  category = 'การมาเรียน'
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE home_visits
SET overall_assessment = 'บ้านอยู่ในสภาพดีและสามารถติดตามช่วยเหลือได้ต่อเนื่อง'
WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

UPDATE report_jobs AS r
SET title = v.title
FROM (VALUES
  ('student_summary','รายงานสรุปนักเรียน'),
  ('risk_report','รายงานกลุ่มเสี่ยง'),
  ('attendance_report','รายงานการมาเรียน'),
  ('behavior_report','รายงานพฤติกรรม'),
  ('academic_report','รายงานผลการเรียน')
) AS v(report_type, title)
WHERE r.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND r.report_type = v.report_type;

UPDATE notifications AS n
SET
  title = v.title,
  message = v.message
FROM (VALUES
  ('risk_alert'::notification_type,'นักเรียนกลุ่มเสี่ยงสูง','มีนักเรียนที่คะแนนความเสี่ยงเกิน 80 จำนวน 3 คน'),
  ('attendance_alert'::notification_type,'นักเรียนขาดเรียน','มีนักเรียนขาดเรียนต่อเนื่อง 2 คน'),
  ('behavior_alert'::notification_type,'พฤติกรรมที่ต้องติดตาม','นักเรียน ม.2/1 มีพฤติกรรมที่ต้องติดตาม'),
  ('plan_review'::notification_type,'ทบทวนแผนพัฒนา','ถึงเวลาทบทวนแผนพัฒนา ภาคเรียน 1/2567'),
  ('system'::notification_type,'อัปเดตระบบ','ระบบได้อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว'),
  ('general'::notification_type,'ยินดีต้อนรับ','ยินดีต้อนรับเข้าสู่ระบบ SCIDAS')
) AS v(type, title, message)
WHERE n.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
  AND n.type = v.type;

UPDATE student_notes AS sn
SET body = 'บันทึกการติดตาม: ' || s.first_name || ' มีพัฒนาการที่ดีขึ้นในด้านการเรียน'
FROM students s
WHERE sn.student_id = s.id
  AND sn.school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e';

-- VERIFICATION QUERIES
-- �•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�
-- Copy only this query into a separate SQL Editor tab after the seed runs.

/*
SELECT 'schools' AS tbl, COUNT(*) FROM schools WHERE id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'students', COUNT(*) FROM students WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'guardians', COUNT(*) FROM guardians WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'classrooms', COUNT(*) FROM classrooms WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'classroom_subjects', COUNT(*) FROM classroom_subjects WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'attendance_records', COUNT(*) FROM attendance_records WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'academic_scores', COUNT(*) FROM academic_scores WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'behavior_records', COUNT(*) FROM behavior_records WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'risk_assessments', COUNT(*) FROM risk_assessments WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'risk_factors', COUNT(*) FROM risk_factors WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'support_records', COUNT(*) FROM support_records WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'development_plans', COUNT(*) FROM development_plans WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'home_visits', COUNT(*) FROM home_visits WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'report_jobs', COUNT(*) FROM report_jobs WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
UNION ALL SELECT 'student_notes', COUNT(*) FROM student_notes WHERE school_id = '45ef7b2c-5be1-4774-8f46-d1035fe3151e'
ORDER BY tbl;
*/
