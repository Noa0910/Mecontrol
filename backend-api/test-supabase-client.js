const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jikjuutgacyzlxiczrrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa2p1dXRnYWN5emx4aWN6cnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM4MjksImV4cCI6MjA3Njg5OTgyOX0.gFsKJ8z23cWS4asH12UCFAL4KCQMwz3tuFI_wyPdqbU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔄 Probando conexión local a Supabase...');
    
    const { data, error } = await supabase
      .from('atenciones_urgencias')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Conexión local a Supabase exitosa!');
      console.log('📊 Datos disponibles:', data);
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

testSupabaseConnection();
