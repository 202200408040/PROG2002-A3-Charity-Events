# UnityAid Charity Events

Team project for PROG2002 Web Development II Assessment 3.

The project extends the Assessment 2 charity events website with event registration, registration records, event management APIs and an Angular 22 admin website. The public website and the admin website are separate Angular applications that share common models, services and layout components.

## Current Features

- Dynamic charity event listing
- Search by date, location and category
- Event details and fundraising progress
- Event registration with validation and duplicate protection
- Registration records shown on event detail and admin pages
- Open-Meteo weather information on event detail pages
- Admin event list showing active, past and suspended events
- Admin create, edit and delete event workflows
- Registration counts and tickets sold in the admin list
- Shared header, navigation and footer components
- Angular 22 and TypeScript for both front-end applications

## Technologies

- Node.js 22 and Express for the REST API
- MySQL for persistent data
- Angular 22 and TypeScript for the client and admin applications
- CSS for styling
- mysql2 for database access
- dotenv for local environment variables
- Open-Meteo API for event location weather

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
charity-events-angular/projects/shared-data
charity-events-angular/projects/shared-ui
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
- Latitude and longitude for each sample event

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

Then set the local MySQL password. The `.env` file is ignored by Git and must not be committed.

## Run the API

```bash
cd TaoLiuA3-api
npm install
node server.js
```

The API runs at `http://localhost:3000`.

## Run the Angular Applications

Install the Angular dependencies once:

```bash
cd charity-events-angular
npm install
```

Run the public website:

```bash
npx ng serve clientside --port 4200
```

Open `http://localhost:4200/`.

Run the admin website in a second terminal:

```bash
npx ng serve adminside --port 4201
```

Open `http://localhost:4201/`.

Both development servers use `proxy.conf.json` to forward `/api` requests to the Express API on port 3000.

## Build

```bash
cd charity-events-angular
npx ng build shared-data
npx ng build shared-ui
npx ng build clientside
npx ng build adminside
```

## API Endpoints

Public endpoints:

- `GET /api/events/home`
- `GET /api/categories`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/registrations`

Admin endpoints:

- `GET /api/admin/events`
- `GET /api/admin/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

`GET /api/events/:id` returns the event details, its registrations ordered by newest registration date, the registration count and the total tickets sold.

Registration request body:

```json
{
  "event_id": 2,
  "user_name": "Liu Tao",
  "email": "liu.tao@example.com",
  "phone": "0400000000",
  "number_of_tickets": 2
}
```

The registration date is set by the server using `CURDATE()`. Duplicate registrations for the same email and event return HTTP 409.

The admin list includes active, past and suspended events plus registration and ticket totals. Deleting an event that already has registrations returns HTTP 409 to protect registration history.

## Team

PROG2002 Web Development II Assessment 3
