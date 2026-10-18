-- Create the local database
CREATE DATABASE IF NOT EXISTS charityevents_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE charityevents_db;

-- 1. Charity organisations table
CREATE TABLE organisations (
    organisation_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    mission TEXT,
    email VARCHAR(150),
    phone VARCHAR(30)
);

-- 2. Event categories table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 3. Events table
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    category_id INT NOT NULL,

    name VARCHAR(150) NOT NULL,
    short_description VARCHAR(255),
    full_description TEXT,

    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(150) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,

    ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    image_url VARCHAR(500),
    status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',

    CONSTRAINT fk_events_organisation
        FOREIGN KEY (organisation_id)
        REFERENCES organisations(organisation_id),

    CONSTRAINT fk_events_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);

-- Improve homepage filtering by status and event date
CREATE INDEX idx_events_status_date
ON events (status, event_date);


-- 4. Event registrations table
CREATE TABLE registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    registration_date DATE NOT NULL,
    number_of_tickets INT NOT NULL,

    CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_registration_event_email
        UNIQUE (event_id, email),

    CONSTRAINT chk_registration_tickets
        CHECK (number_of_tickets > 0)
);

CREATE INDEX idx_registrations_event_date
ON registrations (event_id, registration_date);
-- Insert a charity organisation
INSERT INTO organisations (
    name,
    mission,
    email,
    phone
) VALUES (
    'UnityAid',
    'Connecting communities and raising funds for people in need.',
    'hello@unityaid.org',
    '02 1234 5678'
);

-- Insert event categories
INSERT INTO categories (name, description) VALUES
('Fun Run', 'Community running and walking events'),
('Gala Dinner', 'Formal fundraising dinners'),
('Silent Auction', 'Auctions supporting charity projects'),
('Concert', 'Music events raising funds for charity'),
('Community Workshop', 'Educational and community activities');

-- Insert eight sample events
INSERT INTO events (
    organisation_id,
    category_id,
    name,
    short_description,
    full_description,
    event_date,
    event_time,
    location,
    latitude,
    longitude,
    ticket_price,
    fundraising_goal,
    current_amount,
    image_url,
    status
) VALUES
(
    1, 1, 'City Fun Run',
    'Run or walk to support local families.',
    'Join our annual City Fun Run. Participants can choose a 5 km or 10 km route. All money raised supports local families facing financial hardship.',
    '2026-10-18', '08:00:00', 'Lismore Riverside Park',
    -28.813300, 153.277300,
    0.00, 10000.00, 4200.00,
    'images/city-fun-run.svg',
    'active'
),
(
    1, 2, 'Hope Charity Gala Dinner',
    'An evening of dinner, music and fundraising.',
    'Enjoy a three-course dinner while supporting community programs. The evening includes live music, guest speakers and a charity auction.',
    '2026-11-07', '18:30:00', 'Lismore Community Hall',
    -28.813900, 153.279200,
    120.00, 25000.00, 12800.00,
    'images/charity-gala.svg',
    'active'
),
(
    1, 3, 'Art for Good Silent Auction',
    'Bid on local artwork and support charity projects.',
    'Local artists have donated paintings, prints and sculptures. All proceeds will fund food, housing and education programs.',
    '2026-11-21', '17:00:00', 'Northern Rivers Gallery',
    -28.807500, 153.274800,
    50.00, 15000.00, 6750.00,
    'images/silent-auction.svg',
    'active'
),
(
    1, 4, 'Hope Live Concert',
    'A live music event for the whole community.',
    'Enjoy performances from local musicians while helping raise funds for children and families in need.',
    '2026-12-05', '19:00:00', 'Lismore City Hall',
    -28.812800, 153.278700,
    75.00, 20000.00, 9200.00,
    'images/hope-concert.svg',
    'active'
),
(
    1, 5, 'Community Garden Workshop',
    'Learn sustainable gardening and meet neighbours.',
    'This free workshop teaches composting, seasonal planting and water-saving gardening techniques.',
    '2026-10-25', '10:00:00', 'East Lismore Community Centre',
    -28.824200, 153.300400,
    0.00, 3000.00, 850.00,
    'images/garden-workshop.svg',
    'active'
),
(
    1, 1, 'Winter Food Drive Walk',
    'A past event used to test date filtering.',
    'Participants walked through the city and collected donations for local food banks. This event has already finished.',
    '2026-08-15', '09:00:00', 'Lismore Town Centre',
    -28.813500, 153.276300,
    10.00, 8000.00, 8000.00,
    'images/city-fun-run.svg',
    'active'
),
(
    1, 2, 'Charity Golf Day',
    'A team golf event supporting youth programs.',
    'Teams of four compete in a friendly charity tournament. The registration fee includes lunch and prizes.',
    '2027-01-16', '07:30:00', 'Lismore Golf Club',
    -28.836900, 153.274900,
    150.00, 30000.00, 11500.00,
    'images/golf-day.svg',
    'active'
),
(
    1, 4, 'Unverified Benefit Concert',
    'A suspended event that must not appear on the home page.',
    'This event is suspended because it does not meet the charity policy requirements.',
    '2026-12-19', '18:00:00', 'Ballina Entertainment Centre',
    -28.861600, 153.566000,
    60.00, 12000.00, 0.00,
    'images/hope-concert.svg',
    'suspended'
);

-- Insert ten sample event registrations
INSERT INTO registrations (
    event_id,
    user_name,
    email,
    phone,
    registration_date,
    number_of_tickets
) VALUES
(1, 'Emma Wilson', 'emma.wilson@example.com', '0400 000 001', '2026-10-01', 2),
(2, 'Emma Wilson', 'emma.wilson@example.com', '0400 000 001', '2026-10-02', 1),
(2, 'Liam Chen', 'liam.chen@example.com', '0400 000 002', '2026-10-03', 2),
(3, 'Sophia Brown', 'sophia.brown@example.com', '0400 000 003', '2026-10-04', 1),
(4, 'Noah Taylor', 'noah.taylor@example.com', '0400 000 004', '2026-10-05', 2),
(5, 'Ava Martin', 'ava.martin@example.com', '0400 000 005', '2026-10-06', 3),
(7, 'Ethan Lee', 'ethan.lee@example.com', '0400 000 006', '2026-10-07', 4),
(1, 'Mia Anderson', 'mia.anderson@example.com', '0400 000 007', '2026-10-08', 1),
(3, 'Isla White', 'isla.white@example.com', '0400 000 008', '2026-10-09', 2),
(4, 'Oliver Harris', 'oliver.harris@example.com', '0400 000 009', '2026-10-10', 3);
