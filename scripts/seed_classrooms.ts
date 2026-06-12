import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function seedClassrooms() {
  console.log('🌱 Starting classroom seed...');

  // 1. Get school
  const { data: school } = await supabase.from('schools').select('id').limit(1).single();
  if (!school) return console.error('No school found');

  // 2. Get teacher (our admin user)
  const { data: profile } = await supabase.from('profiles').select('id').eq('school_id', school.id).limit(1).single();
  if (!profile) return console.error('No teacher profile found');

  // 3. Create Academic Year
  const { error: yrErr } = await supabase.from('academic_years')
    .insert({ 
      school_id: school.id, 
      year: '2567', 
      start_date: '2024-05-16',
      end_date: '2025-03-31',
      is_current: true 
    })
    .select().single();
  
  if (yrErr) {
    if (yrErr.code !== '23505') return console.error('Error creating academic year:', yrErr);
  }

  const { data: currentYear } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
  const yearId = currentYear!.id;

  // 4. Create Semester
  const { error: semErr } = await supabase.from('semesters')
    .insert({ academic_year_id: yearId, semester: 'semester_1', start_date: '2024-05-16', end_date: '2024-10-15', is_current: true })
    .select().single();
    
  if (semErr) {
    if (semErr.code !== '23505') return console.error('Error creating semester:', semErr);
  }

  const { data: currentSem } = await supabase.from('semesters').select('id').eq('is_current', true).single();
  const semId = currentSem!.id;

  // 5. Create Classroom
  const { error: clsErr } = await supabase.from('classrooms')
    .insert({
      school_id: school.id,
      name: 'ม.4/1',
      grade_level: 'm4',
      section: 1,
      academic_year_id: yearId,
      homeroom_teacher_id: profile.id
    })
    .select().single();

  if (clsErr) {
    if (clsErr.code !== '23505') return console.error('Error creating classroom:', clsErr);
  }

  const { data: currentClass } = await supabase.from('classrooms').select('id').eq('name', 'ม.4/1').single();
  const classId = currentClass!.id;

  // 6. Get existing students
  const { data: students } = await supabase.from('students').select('id').eq('school_id', school.id);
  if (!students || students.length === 0) return console.error('No students found to enroll');

  // 7. Enroll students into classroom
  const enrollments = students.map(s => ({
    classroom_id: classId,
    student_id: s.id,
    semester_id: semId,
    is_active: true
  }));

  const { error: enrollErr } = await supabase.from('classroom_students').insert(enrollments);
  if (enrollErr && enrollErr.code !== '23505') {
    return console.error('Error enrolling students:', enrollErr);
  }

  console.log('✅ Classroom seeded and students enrolled successfully!');
}

seedClassrooms();
