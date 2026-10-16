# UnityAid Charity Events

This is the team project for PROG2002 Web Development II Assessment 3. It is a charity events website built with Node.js, Express and MySQL. The frontend uses plain HTML, CSS and JavaScript.

## What the website does

- Shows current and upcoming charity events on the home page
- Lets users search by date, location and category
- Shows the details and fundraising progress for a selected event
- Includes a Register button with an "under construction" message

## Technologies

- Node.js and Express for the server and API
- MySQL for the database
- HTML, CSS, JavaScript and DOM for the client website
- mysql2 for the database connection
- dotenv for local environment variables

I did not use a CSS framework, JavaScript framework or template engine.

## Database setup

Import this file into MySQL:

```text
TaoLiuA3-api/database/charityevents_db.sql
```

The script creates the `charityevents_db` database, three tables and eight sample events.

## Environment variables

Copy:

```text
TaoLiuA3-api/.env.example
```

to:

```text
TaoLiuA3-api/.env
```

Then replace `your_password` with your own MySQL password.

## How to run

Open a terminal in the API folder and run:

```bash
cd TaoLiuA3-api
npm install
node server.js
```

Then open:

```text
http://localhost:3000/
```

## Pages

- Home: `http://localhost:3000/`
- Search events: `http://localhost:3000/search.html`
- Event details: `http://localhost:3000/event.html?id=2`

## API endpoints

- `GET /api/events/home`
- `GET /api/categories`
- `GET /api/events`
- `GET /api/events/:id`

A search example:

```text
GET /api/events?date=2026-11-07&location=Lismore&category=2
```

## Author

Tao Liu

PROG2002 Web Development II

