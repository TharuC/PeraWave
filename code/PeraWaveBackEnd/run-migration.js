const { Client } = require('pg');

const DIRECT_URL = 'postgresql://postgres.ntamtoyqmhqvvrbarnvq:Pera%261324*%26@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString: DIRECT_URL });
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      ALTER TABLE "ForumPost"
      ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('Added isFlagged to ForumPost');

    await client.query(`
      ALTER TABLE "Comment"
      ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('Added isFlagged to Comment');

    // Mark the migration as applied in the _prisma_migrations table
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid()::text,
        'manual',
        NOW(),
        '20260702060000_add_isflagged_columns',
        NULL,
        NULL,
        NOW(),
        1
      )
      ON CONFLICT DO NOTHING;
    `);
    console.log('Migration recorded in _prisma_migrations');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Done!');
  }
}

run();
