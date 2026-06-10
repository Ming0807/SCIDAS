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
  console.log('🌱 Starting student user seeding...');

  // Get all students without a user_id
  const { data: students, error: fetchErr } = await supabase
    .from('students')
    .select('id, student_code, first_name, last_name')
    .is('user_id', null);

  if (fetchErr) {
    console.error('Error fetching students:', fetchErr);
    return;
  }

  if (!students || students.length === 0) {
    console.log('✅ No students without a user_id found. Everything is up to date.');
    return;
  }

  console.log(`Found ${students.length} students without user accounts. Creating...`);

  for (const student of students) {
    const email = `${student.student_code.toLowerCase()}@student.scidas.local`;
    const password = `${student.student_code}123!`;

    // Try to create the user in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        is_student: true,
        student_id: student.id,
        name: `${student.first_name} ${student.last_name}`,
      }
    });

    if (authErr) {
      if (authErr.message.includes('User already registered')) {
         // Maybe user exists, try fetching them by email
         console.log(`User ${email} already exists, skipping or could find and update.`);
         continue;
      }
      console.error(`Error creating user for student ${student.student_code}:`, authErr);
      continue;
    }

    const userId = authData.user.id;

    // Update the students table
    const { error: updateErr } = await supabase
      .from('students')
      .update({ user_id: userId })
      .eq('id', student.id);

    if (updateErr) {
      console.error(`Error updating student ${student.student_code} with user_id:`, updateErr);
    } else {
      console.log(`✅ Created user for ${student.student_code} (Email: ${email}, Password: ${password})`);
    }
  }

  console.log('✅ Student user seeding complete!');
}

seed();
