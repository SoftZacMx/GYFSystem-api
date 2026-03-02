import 'reflect-metadata';
import { appDataSource } from './config/data-source';

appDataSource
  .initialize()
  .then(() => appDataSource.runMigrations())
  .then((migrations) => {
    if (migrations.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Ran ${migrations.length} migration(s):`, migrations.map((m) => m.name));
    }
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => appDataSource.destroy().then(() => process.exit(0)));
