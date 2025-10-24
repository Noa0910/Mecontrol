const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  user: 'postgres.jikjuutgacyzlxiczrrh',
  password: 'JX71EllZRtUC8oiJ',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT COUNT(*) as total FROM atenciones_urgencias')
  .then(result => {
    console.log('✅ Conexión exitosa! Total atenciones:', result.rows[0].total);
    pool.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    pool.end();
  });
