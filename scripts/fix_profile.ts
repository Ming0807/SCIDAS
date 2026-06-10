import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function fixProfile() {
  console.log('Fixing user profile...');
  
  // 1. Get the school ID from the first school
  const { data: school } = await supabase.from('schools').select('id').limit(1).single();
  if (!school) {
    console.log('No schools found.');
    return;
  }
  
  // 2. Update all profiles to have this school_id and role = 'admin'
  const { error } = await supabase
    .from('profiles')
    .update({ 
      school_id: school.id,
      role: 'admin'
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all existing profiles
    
  if (error) {
    console.error('Failed to update profiles:', error);
  } else {
    console.log('✅ All profiles updated to Admin for school:', school.id);
  }
}

fixProfile();
