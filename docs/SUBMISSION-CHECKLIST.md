# A3 Submission Checklist

## 1. Before deployment

- [ ] Confirm the MySQL database `charityevents_db` imports without errors.
- [ ] Confirm `TaoLiuA3-api/.env` contains the correct local database password.
- [ ] Run `npm install` and `node server.js` in `TaoLiuA3-api`.
- [ ] Run `npx ng serve clientside --port 4200` and check the public site.
- [ ] Run `npx ng serve adminside --port 4201` and check the admin site.
- [ ] Test search with date, location and category filters.
- [ ] Test registration and confirm a duplicate email returns a clear error.
- [ ] Test deleting an event with registrations and confirm the 409 message appears.

## 2. SCU cPanel deployment

Each student must deploy to their own SCU cPanel account.

- [ ] Create the MySQL database and import `charityevents_db.sql`.
- [ ] Upload the Express API and register it as a Node.js application.
- [ ] Set the database environment variables in cPanel.
- [ ] Upload `dist/clientside/browser` as the public website.
- [ ] Upload `dist/adminside/browser` as the admin website.
- [ ] Make sure `/api` requests reach the Node.js API from both websites.
- [ ] Open both live URLs and repeat the main tests.
- [ ] Copy the live URLs into section 9 of the report.

## 3. Submission files

- [ ] `TaoLiuA3-clientside.zip`
- [ ] `TaoLiuA3-adminside.zip`
- [ ] `TaoLiuA3-api.zip`
- [ ] `PROG2002 A3 Project Report - Tao Liu.docx`
- [ ] GitHub repository link: https://github.com/202200408040/PROG2002-A3-Charity-Events
- [ ] Video link from SCU OneDrive
- [ ] Peer evaluation form sent directly to the tutor

The three ZIP files and the report are in `D:\codex\PROG2002-A3\submission`.

## 4. Video

- [ ] Keep the video under 15 minutes.
- [ ] Explain the database schema and ERD.
- [ ] Show the Express API and test one endpoint.
- [ ] Explain the Angular data flow from component to service to API.
- [ ] Demonstrate the public home, search, detail and registration pages.
- [ ] Demonstrate the admin list, create, edit and blocked delete.
- [ ] Upload to SCU OneDrive and create a shareable link.

## 5. Team and late submission

- [ ] Notify the tutor/UA that the group member has not contributed.
- [ ] Keep GitHub commits and communication records as evidence.
- [ ] Do not invent or describe work that the other member did not do.
- [ ] Apply for special consideration or an extension if eligible.
- [ ] Check the final GenAI declaration against the actual tools and purposes used.
