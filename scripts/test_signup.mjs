import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing signup...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_fake_email_12345@gmail.com',
    password: 'Password123'
  });
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
