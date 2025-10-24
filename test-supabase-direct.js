import { supabase } from './src/supabaseClient';

async function testSupabaseConnection() {
  try {
    console.log('🔄 Probando conexión directa a Supabase...');
    
    const { data, error } = await supabase
      .from('atenciones_urgencias')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Conexión directa a Supabase exitosa!');
      console.log('📊 Datos disponibles:', data);
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

testSupabaseConnection();
