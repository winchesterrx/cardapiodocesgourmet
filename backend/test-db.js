import db from './db.js';

async function run() {
  const [rows] = await db.query('SELECT * FROM products WHERE is_promo = 1');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
run();
