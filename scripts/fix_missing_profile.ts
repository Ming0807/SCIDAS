import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function fixMissingProfile() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users[0];
  
  if (!user) {
    console.log('No user found in auth.users');
    return;
  }
  
  const { data: school } = await supabase.from('schools').select('id').limit(1).single();
  const schoolId = school?.id;
  
  console.log(`Creating profile for ${user.email} with school_id ${schoolId}...`);
  
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    school_id: schoolId
  });
  
  if (error) {
    console.error('Error creating profile:', error);
  } else {
    console.log('✅ Profile created successfully!');
  }
}

fixMissingProfile();
