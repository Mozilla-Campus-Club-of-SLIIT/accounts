# accounts

> The all in one accounts service for Mozilla Campus Club of SLIIT

## Why this project?

- Shared accounts service to be used across all sliitmozilla projects
- SSO (Single Sign On) for all sliitmozilla projects
- Authentication (Login with SLIIT Mozilla) and role based access provision

## Setup

### Requirements

- make
- Go (backend)
- Node.js (frontend)
- PostgreSQL
- Redis

#### Frontend setup

To develop in frontend, make sure you have installed Node.js first (preferably node v22+)

```bash
# navigate to the frontend
cd frontend

# install dependencies
npm i --include=dev
```

#### Backend setup

To develop in backend, make sure you have installed Go first

Then issue the following command from the root of the project

```bash
# install relevant modules
go mod download
```

Create a `.env` file with the following content. The values passed are examples

```properties
DB_URL=postgresql://user:pass@localhost:5432/accounts_sliitmozilla
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=secret
```

#### Setting up databases

##### PostgreSQL

The service uses PostgreSQL as its primary database. Setup a postgres database and pass the url to the `DB_URL` property in the `.env` file.

After creating the database, connect to the database
```bash
psql <DB_URL>
# eg: psql postgresql://user:pass@localhost:5432/accounts_sliitmozilla
```

Then paste and execute the database scripts present in `db/sql` in order. Make sure to run the scripts present in `migrations` only after executing all the sql files present in the `db/sql` folder.

For development purposes, you may want to create a user an make that user an admin. The way you can do that at the moment is described below. 
> [!NOTE] These steps should be automated later with a populate script

1. Create a user with the signup form (refer to [Starting the service](#starting-the-service) section for more details on how to start)
2. Connect to the database using `psql` command (refer to [PostgreSQL](#postgesql) section for more details)
3. Execute the following SQL
```sql
-- first find user id
SELECT id FROM Users WHERE email='YOUR_EMAIL';
-- then insert that id to UserRoles table with admin role
INSERT INTO UserRoles VALUES ('USER_ID_FROM_ABOVE_STEP', 'admin');

-- or do that all in one step
INSERT INTO UserRoles VALUES (
    (SELECT id FROM Users WHERE email='YOUR_EMAIL'),
    'admin'
);
```

### Building

To build, you need `make`. It should be doable without the tool aswell. Just follow the commands in `Makefile` if you do so.

With `make`, execute the following command to build

```bash
make build
```

The build script will generate all documentation, build frontend code and create an executable `server` file in teh `build` folder.

### Starting the service

Simply execute `make run`. This will run both frontend and backend components as a unit.

Running the frontend separately is not recommended, but if you insist, do it by running `npm run dev` from the `frontend` folder.

### API Documentation

The production documentation can be found in https://accounts.sliitmozilla.org/api/docs/

The documentation follows [OpenAPI specifications](https://swagger.io/specification/). Also refer to [swaggo documentation](https://github.com/swaggo/swag?tab=readme-ov-file) on how to write documentation for Go files.

To generate documentation files, execute the `make docs` command
