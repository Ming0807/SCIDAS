import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

// Load .env.local
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seed...');

  // 1. Create a dummy school
  const { data: school, error: schoolErr } = await supabase
    .from('schools')
    .insert({
      name: 'โรงเรียนตัวอย่าง',
      school_code: 'SCH9999',
      is_active: true
    })
    .select()
    .single();

  if (schoolErr) {
    if (schoolErr.code === '23505') { // Unique violation
      console.log('School already exists. Skipping school creation.');
    } else {
      console.error('Error creating school:', schoolErr);
      return;
    }
  }

  // Get the school id
  const { data: existingSchool } = await supabase.from('schools').select('id').limit(1).single();
  const schoolId = existingSchool?.id;

  if (!schoolId) {
    console.error('No school found to link students to.');
    return;
  }

  // 2. Insert dummy students
  const students = [
    {
      school_id: schoolId,
      student_code: 'STD001',
      first_name: 'สมชาย',
      last_name: 'รักเรียน',
      gender: 'male',
      date_of_birth: '2010-05-14',
      status: 'active'
    },
    {
      school_id: schoolId,
      student_code: 'STD002',
      first_name: 'สมหญิง',
      last_name: 'ขยันยิ่ง',
      gender: 'female',
      date_of_birth: '2011-02-28',
      status: 'active'
    },
    {
      school_id: schoolId,
      student_code: 'STD003',
      first_name: 'มานะ',
      last_name: 'อดทน',
      gender: 'male',
      date_of_birth: '2009-11-05',
      status: 'active'
    }
  ];

  const { error: studentErr } = await supabase
    .from('students')
    .insert(students);

  if (studentErr) {
    if (studentErr.code === '23505') {
      console.log('Students already exist.');
    } else {
      console.error('Error inserting students:', studentErr);
      return;
    }
  }

  console.log('✅ Seed complete! Inserted mock students successfully.');
}

seed();
