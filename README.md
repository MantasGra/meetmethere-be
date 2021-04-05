# MeetMeThere Backend API

## Database Migrations
Migrations are run automatically when the server is started. To generate a migration run:
```
npm run typeorm migration:generate -- -n MigrationName
```
**Note**: Make sure to have correct configuration in [ormconfig.json](./ormconfig.json). This configuration is used to compare code with the actual state of the database.
