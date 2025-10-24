const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.jikjuutgacyzlxiczrrh.supabase.co',
  user: 'postgres',
  password: 'JX71EllZRtUC8oiJ',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT COUNT(*) as total FROM atenciones_urgencias')
  .then(result => {
    console.log('✅ Conexión directa exitosa! Total atenciones:', result.rows[0].total);
    pool.end();
  })
  .catch(err => {
    console.error('❌ Error conexión directa:', err.message);
    pool.end();
  });
