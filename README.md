# UnityAid Charity Events

Team project for PROG2002 Web Development II Assessment 3.

The project extends the Assessment 2 charity events website with event registration, registration records, event management APIs and an Angular admin-side website.

## Current Features

- Dynamic charity event listing
- Search by date, location and category
- Event details and fundraising progress
- Event registration database table
- Ten sample registration records
- Angular 22 workspace for the client and admin applications

Registration pages, activity CRUD APIs and the admin interface are being developed for Assessment 3.

## Technologies

- Node.js 22 and Express for the REST API
- MySQL for persistent data
- Angular 22 and TypeScript for the new client and admin applications
- CSS for styling
- mysql2 for database access
- dotenv for local environment variables

## Project Structure

```text
PROG2002-A3/
├── TaoLiuA3-api/
├── TaoLiuA3-clientside/
├── TaoLiuA3-adminside/
├── charity-events-angular/
└── README.md
```

The `TaoLiuA3-clientside` and `TaoLiuA3-adminside` folders contain the original assessment baseline. The current Angular applications are under:

```text
charity-events-angular/projects/clientside
charity-events-angular/projects/adminside
```

## Database Setup

Import:

```text
TaoLiuA3-api/database/charityevents_db.sql
```

The script creates:

- `organisations`
- `categories`
- `events`
- `registrations`
- Eight sample events
- Ten sample event registrations

The registrations table includes a foreign key to `events`, a unique constraint preventing duplicate registration for the same email and event, a ticket-count check constraint and an event/date index.

## Environment Variables

Copy:

```text
TaoLiuA3-api/.env.example
```

to:

```text
TaoLiuA3-api/.env
```

Then set the local MySQL password.

## Run the API

```bash
cd TaoLiuA3-api
npm install
node server.js
```

## Run Angular Applications

```bash
cd charity-events-angular
npm install
ng serve clientside --port 4200
```

Open `http://localhost:4200/`.

To run the admin application:

```bash
ng serve adminside --port 4201
```

Open `http://localhost:4201/`.

## Existing API Endpoints

- `GET /api/events/home`
- `GET /api/categories`
- `GET /api/events`
- `GET /api/events/:id`

Assessment 3 registration and event-management endpoints will be added during development.

## Team

PROG2002 Web Development II Assessment 3
