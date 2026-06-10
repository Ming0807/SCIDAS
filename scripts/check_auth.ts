import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log('Users in auth.users:', users.users.map(u => ({ id: u.id, email: u.email })));
  
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles in DB:', profiles);
  
  const { data: students } = await supabase.from('students').select('*');
  console.log('Students in DB:', students);
}

check();
