const express = require("express");
const path = require("path");
const db = require("./event_db");

const app = express();
const PORT = 3000;
const MAX_LOCATION_LENGTH = 100;

app.disable("x-powered-by");
app.use(express.json());
app.use(express.static(path.join(__dirname, "../TaoLiuA3-clientside")));

function getQueryString(value) {
    if (value === undefined) {
        return "";
    }

    if (Array.isArray(value) || typeof value !== "string") {
        return null;
    }

    return value.trim();
}

function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
}

function escapeLikePattern(value) {
    return value.replace(/[!%_]/g, "!$&");
}


/**
 * Validates and normalises event registration input.
 *
 * @param {unknown} body The JSON request body.
 * @returns {{ error: string } | { value: { eventId: number, userName: string, email: string, phone: string, numberOfTickets: number } }} Validation result.
 */
function parseRegistrationInput(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Registration details are required" };
    }

    const eventId = Number(body.event_id);
    const userName = typeof body.user_name === "string" ? body.user_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const numberOfTickets = Number(body.number_of_tickets);

    if (!Number.isSafeInteger(eventId) || eventId <= 0) {
        return { error: "Event ID must be a positive integer" };
    }

    if (!userName || userName.length > 100) {
        return { error: "User name is required and must not exceed 100 characters" };
    }

    if (!email || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "A valid email address is required" };
    }

    if (!phone || phone.length > 30) {
        return { error: "Phone number is required and must not exceed 30 characters" };
    }

    if (!Number.isSafeInteger(numberOfTickets) || numberOfTickets <= 0) {
        return { error: "Number of tickets must be a positive integer" };
    }

    return {
        value: {
            eventId,
            userName,
            email,
            phone,
            numberOfTickets
        }
    };
}
function sendBadRequest(res, message) {
    return res.status(400).json({ message });
}

// Homepage events API
app.get("/api/events/home", (req, res) => {
    const sql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.event_date,
            e.event_time,
            e.location,
            e.latitude,
            e.longitude,
            e.ticket_price,
            e.fundraising_goal,
            e.current_amount,
            e.image_url,
            c.name AS category
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        WHERE e.status = 'active'
          AND e.event_date >= CURDATE()
        ORDER BY e.event_date ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Homepage events query failed:", error.message);
            return res.status(500).json({
                message: "Unable to retrieve events"
            });
        }

        res.json(results);
    });
});

// Event categories API
app.get("/api/categories", (req, res) => {
    const sql = `
        SELECT
            category_id,
            name,
            description
        FROM categories
        ORDER BY category_id ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Category query failed:", error.message);
            return res.status(500).json({
                message: "Unable to retrieve categories"
            });
        }

        res.json(results);
    });
});

// Event search API
app.get("/api/events", (req, res) => {
    const date = getQueryString(req.query.date);
    const location = getQueryString(req.query.location);
    const category = getQueryString(req.query.category);

    if (date === null || location === null || category === null) {
        return sendBadRequest(res, "Query parameters must contain a single value");
    }

    if (date && !isValidDateString(date)) {
        return sendBadRequest(res, "Date must use the YYYY-MM-DD format");
    }

    if (location && location.length > MAX_LOCATION_LENGTH) {
        return sendBadRequest(res, `Location must not exceed ${MAX_LOCATION_LENGTH} characters`);
    }

    if (category && !/^[1-9]\d*$/.test(category)) {
        return sendBadRequest(res, "Category must be a positive integer");
    }

    const conditions = ["e.status = 'active'"];
    const values = [];

    if (date) {
        conditions.push("e.event_date = ?");
        values.push(date);
    }

    if (location) {
        conditions.push("e.location LIKE ? ESCAPE '!'");
        values.push(`%${escapeLikePattern(location)}%`);
    }

    if (category) {
        conditions.push("e.category_id = ?");
        values.push(Number(category));
    }

    const sql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.event_date,
            e.event_time,
            e.location,
            e.latitude,
            e.longitude,
            e.ticket_price,
            e.fundraising_goal,
            e.current_amount,
            e.image_url,
            c.name AS category
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.event_date ASC
    `;

    db.execute(sql, values, (error, results) => {
        if (error) {
            console.error("Event search query failed:", error.message);
            return res.status(500).json({
                message: "Unable to search events"
            });
        }

        res.json(results);
    });
});

// Registration API
/**
 * Creates a new registration for an active charity event.
 *
 * @param {import("express").Request} req Express request containing registration details.
 * @param {import("express").Response} res Express response containing the created registration.
 * @returns {void}
 */
app.post("/api/registrations", (req, res) => {
    const parsed = parseRegistrationInput(req.body);

    if (parsed.error) {
        return sendBadRequest(res, parsed.error);
    }

    const { eventId, userName, email, phone, numberOfTickets } = parsed.value;
    const eventSql = `
        SELECT event_id, name
        FROM events
        WHERE event_id = ?
          AND status = 'active'
    `;

    db.execute(eventSql, [eventId], (eventError, eventRows) => {
        if (eventError) {
            console.error("Registration event lookup failed:", eventError.message);
            return res.status(500).json({ message: "Unable to create registration" });
        }

        if (eventRows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const insertSql = `
            INSERT INTO registrations (
                event_id,
                user_name,
                email,
                phone,
                registration_date,
                number_of_tickets
            )
            VALUES (?, ?, ?, ?, CURDATE(), ?)
        `;

        db.execute(
            insertSql,
            [eventId, userName, email, phone, numberOfTickets],
            (insertError, result) => {
                if (insertError) {
                    if (insertError.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "This email is already registered for this event"
                        });
                    }

                    console.error("Registration insert failed:", insertError.message);
                    return res.status(500).json({ message: "Unable to create registration" });
                }

                const selectSql = `
                    SELECT
                        registration_id,
                        event_id,
                        user_name,
                        email,
                        phone,
                        registration_date,
                        number_of_tickets
                    FROM registrations
                    WHERE registration_id = ?
                `;

                db.execute(selectSql, [result.insertId], (selectError, rows) => {
                    if (selectError) {
                        console.error("Registration read-back failed:", selectError.message);
                        return res.status(500).json({ message: "Unable to create registration" });
                    }

                    return res.status(201).json({
                        ...rows[0],
                        event_name: eventRows[0].name
                    });
                });
            }
        );
    });
});

// Event details API
/**
 * Retrieves one active event and its registrations, newest first.
 *
 * @param {import("express").Request} req Express request containing the event ID.
 * @param {import("express").Response} res Express response containing event and registration data.
 * @returns {void}
 */
app.get("/api/events/:id", (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const eventId = Number(req.params.id);

    if (!Number.isSafeInteger(eventId)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const eventSql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.full_description,
            e.event_date,
            e.event_time,
            e.location,
            e.latitude,
            e.longitude,
            e.ticket_price,
            e.fundraising_goal,
            e.current_amount,
            e.image_url,
            e.status,
            c.name AS category,
            o.name AS organisation
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        JOIN organisations o ON o.organisation_id = e.organisation_id
        WHERE e.event_id = ?
          AND e.status = 'active'
    `;

    db.execute(eventSql, [eventId], (eventError, eventRows) => {
        if (eventError) {
            console.error("Event details query failed:", eventError.message);
            return res.status(500).json({ message: "Unable to retrieve event details" });
        }

        if (eventRows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const registrationSql = `
            SELECT
                registration_id,
                event_id,
                user_name,
                email,
                phone,
                registration_date,
                number_of_tickets
            FROM registrations
            WHERE event_id = ?
            ORDER BY registration_date DESC, registration_id DESC
        `;

        db.execute(registrationSql, [eventId], (registrationError, registrations) => {
            if (registrationError) {
                console.error("Event registrations query failed:", registrationError.message);
                return res.status(500).json({ message: "Unable to retrieve event details" });
            }

            const ticketsSold = registrations.reduce(
                (total, registration) => total + registration.number_of_tickets,
                0
            );

            return res.json({
                ...eventRows[0],
                registrations,
                registration_count: registrations.length,
                tickets_sold: ticketsSold
            });
        });
    });
});
// Unknown API endpoint
app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API endpoint not found"
    });
});

// Unknown webpage or static file
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Unexpected server error
app.use((error, req, res, next) => {
    console.error("Unexpected server error:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        message: "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
