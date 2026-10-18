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


/**
 * Validates a time value in HH:MM or HH:MM:SS format.
 *
 * @param {string} value Time value to validate.
 * @returns {boolean} Whether the time is valid.
 */
function isValidTimeString(value) {
    return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

/**
 * Validates and normalises event create or update data.
 *
 * @param {unknown} body The JSON request body.
 * @returns {{ error: string } | { value: object }} Validation result.
 */
function parseEventInput(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Event details are required" };
    }

    const organisationId = Number(body.organisation_id);
    const categoryId = Number(body.category_id);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const shortDescription = typeof body.short_description === "string" ? body.short_description.trim() : "";
    const fullDescription = typeof body.full_description === "string" ? body.full_description.trim() : "";
    const eventDate = typeof body.event_date === "string" ? body.event_date.trim() : "";
    const eventTime = typeof body.event_time === "string" ? body.event_time.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const ticketPrice = Number(body.ticket_price);
    const fundraisingGoal = Number(body.fundraising_goal);
    const currentAmount = Number(body.current_amount);
    const imageUrl = typeof body.image_url === "string" && body.image_url.trim()
        ? body.image_url.trim()
        : "images/charity-gala.svg";
    const status = typeof body.status === "string" ? body.status.trim() : "active";

    if (!Number.isSafeInteger(organisationId) || organisationId <= 0) {
        return { error: "Organisation ID must be a positive integer" };
    }

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
        return { error: "Category ID must be a positive integer" };
    }

    if (!name || name.length > 150) {
        return { error: "Event name is required and must not exceed 150 characters" };
    }

    if (!shortDescription || shortDescription.length > 255) {
        return { error: "Short description is required and must not exceed 255 characters" };
    }

    if (!fullDescription) {
        return { error: "Full description is required" };
    }

    if (!isValidDateString(eventDate)) {
        return { error: "Event date must use a valid YYYY-MM-DD date" };
    }

    if (!isValidTimeString(eventTime)) {
        return { error: "Event time must use HH:MM or HH:MM:SS format" };
    }

    if (!location || location.length > 150) {
        return { error: "Location is required and must not exceed 150 characters" };
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        return { error: "Latitude must be between -90 and 90" };
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return { error: "Longitude must be between -180 and 180" };
    }

    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
        return { error: "Ticket price must be zero or greater" };
    }

    if (!Number.isFinite(fundraisingGoal) || fundraisingGoal < 0) {
        return { error: "Fundraising goal must be zero or greater" };
    }

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
        return { error: "Current amount must be zero or greater" };
    }

    if (!["active", "suspended"].includes(status)) {
        return { error: "Status must be active or suspended" };
    }

    return {
        value: {
            organisationId,
            categoryId,
            name,
            shortDescription,
            fullDescription,
            eventDate,
            eventTime,
            location,
            latitude,
            longitude,
            ticketPrice,
            fundraisingGoal,
            currentAmount,
            imageUrl,
            status
        }
    };
}

/**
 * Loads an event and its registrations for administrative use.
 *
 * @param {number} eventId Event identifier.
 * @param {(error: Error | null, event?: object | null) => void} callback Result callback.
 * @returns {void}
 */
function loadAdminEvent(eventId, callback) {
    const eventSql = `
        SELECT
            e.event_id,
            e.organisation_id,
            e.category_id,
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
    `;

    db.execute(eventSql, [eventId], (eventError, eventRows) => {
        if (eventError) {
            return callback(eventError);
        }

        if (eventRows.length === 0) {
            return callback(null, null);
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
                return callback(registrationError);
            }

            const ticketsSold = registrations.reduce(
                (total, registration) => total + registration.number_of_tickets,
                0
            );

            callback(null, {
                ...eventRows[0],
                registrations,
                registration_count: registrations.length,
                tickets_sold: ticketsSold
            });
        });
    });
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
// Admin event list API
/**
 * Retrieves every event regardless of status for the admin website.
 *
 * @param {import("express").Request} req Express request.
 * @param {import("express").Response} res Express response.
 * @returns {void}
 */
app.get("/api/admin/events", (req, res) => {
    const sql = `
        SELECT
            e.event_id,
            e.organisation_id,
            e.category_id,
            e.name,
            e.event_date,
            e.event_time,
            e.location,
            e.status,
            e.ticket_price,
            c.name AS category,
            o.name AS organisation,
            (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count,
            COALESCE((SELECT SUM(r.number_of_tickets) FROM registrations r WHERE r.event_id = e.event_id), 0) AS tickets_sold
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        JOIN organisations o ON o.organisation_id = e.organisation_id
        ORDER BY e.event_date DESC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Admin event list query failed:", error.message);
            return res.status(500).json({ message: "Unable to retrieve admin events" });
        }

        res.json(results);
    });
});

// Admin event details API
/**
 * Retrieves one event and its registrations for the admin website.
 *
 * @param {import("express").Request} req Express request containing the event ID.
 * @param {import("express").Response} res Express response containing the event.
 * @returns {void}
 */
app.get("/api/admin/events/:id", (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    loadAdminEvent(Number(req.params.id), (error, event) => {
        if (error) {
            console.error("Admin event details query failed:", error.message);
            return res.status(500).json({ message: "Unable to retrieve event" });
        }

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json(event);
    });
});

// Create event API
/**
 * Creates a new charity event.
 *
 * @param {import("express").Request} req Express request containing event data.
 * @param {import("express").Response} res Express response containing the created event.
 * @returns {void}
 */
app.post("/api/events", (req, res) => {
    const parsed = parseEventInput(req.body);

    if (parsed.error) {
        return sendBadRequest(res, parsed.error);
    }

    const value = parsed.value;
    const referenceSql = `
        SELECT
            (SELECT COUNT(*) FROM categories WHERE category_id = ?) AS category_exists,
            (SELECT COUNT(*) FROM organisations WHERE organisation_id = ?) AS organisation_exists
    `;

    db.execute(referenceSql, [value.categoryId, value.organisationId], (referenceError, referenceRows) => {
        if (referenceError) {
            console.error("Event reference validation failed:", referenceError.message);
            return res.status(500).json({ message: "Unable to create event" });
        }

        if (!referenceRows[0].category_exists) {
            return sendBadRequest(res, "Selected category does not exist");
        }

        if (!referenceRows[0].organisation_exists) {
            return sendBadRequest(res, "Selected organisation does not exist");
        }

        const insertSql = `
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.execute(
            insertSql,
            [
                value.organisationId,
                value.categoryId,
                value.name,
                value.shortDescription,
                value.fullDescription,
                value.eventDate,
                value.eventTime,
                value.location,
                value.latitude,
                value.longitude,
                value.ticketPrice,
                value.fundraisingGoal,
                value.currentAmount,
                value.imageUrl,
                value.status
            ],
            (insertError, result) => {
                if (insertError) {
                    console.error("Event insert failed:", insertError.message);
                    return res.status(500).json({ message: "Unable to create event" });
                }

                loadAdminEvent(result.insertId, (loadError, createdEvent) => {
                    if (loadError) {
                        console.error("Created event read-back failed:", loadError.message);
                        return res.status(500).json({ message: "Event created but could not be retrieved" });
                    }

                    return res.status(201).json(createdEvent);
                });
            }
        );
    });
});

// Update event API
/**
 * Updates an existing charity event.
 *
 * @param {import("express").Request} req Express request containing the event ID and updated data.
 * @param {import("express").Response} res Express response containing the updated event.
 * @returns {void}
 */
app.put("/api/events/:id", (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const parsed = parseEventInput(req.body);

    if (parsed.error) {
        return sendBadRequest(res, parsed.error);
    }

    const eventId = Number(req.params.id);
    const value = parsed.value;
    const referenceSql = `
        SELECT
            (SELECT COUNT(*) FROM categories WHERE category_id = ?) AS category_exists,
            (SELECT COUNT(*) FROM organisations WHERE organisation_id = ?) AS organisation_exists
    `;

    db.execute(referenceSql, [value.categoryId, value.organisationId], (referenceError, referenceRows) => {
        if (referenceError) {
            console.error("Event reference validation failed:", referenceError.message);
            return res.status(500).json({ message: "Unable to update event" });
        }

        if (!referenceRows[0].category_exists) {
            return sendBadRequest(res, "Selected category does not exist");
        }

        if (!referenceRows[0].organisation_exists) {
            return sendBadRequest(res, "Selected organisation does not exist");
        }

        const updateSql = `
            UPDATE events
            SET
                organisation_id = ?,
                category_id = ?,
                name = ?,
                short_description = ?,
                full_description = ?,
                event_date = ?,
                event_time = ?,
                location = ?,
                latitude = ?,
                longitude = ?,
                ticket_price = ?,
                fundraising_goal = ?,
                current_amount = ?,
                image_url = ?,
                status = ?
            WHERE event_id = ?
        `;

        db.execute(
            updateSql,
            [
                value.organisationId,
                value.categoryId,
                value.name,
                value.shortDescription,
                value.fullDescription,
                value.eventDate,
                value.eventTime,
                value.location,
                value.latitude,
                value.longitude,
                value.ticketPrice,
                value.fundraisingGoal,
                value.currentAmount,
                value.imageUrl,
                value.status,
                eventId
            ],
            (updateError) => {
                if (updateError) {
                    console.error("Event update failed:", updateError.message);
                    return res.status(500).json({ message: "Unable to update event" });
                }

                loadAdminEvent(eventId, (loadError, updatedEvent) => {
                    if (loadError) {
                        console.error("Updated event read-back failed:", loadError.message);
                        return res.status(500).json({ message: "Unable to update event" });
                    }

                    if (!updatedEvent) {
                        return res.status(404).json({ message: "Event not found" });
                    }

                    return res.json(updatedEvent);
                });
            }
        );
    });
});

// Delete event API
/**
 * Deletes an event only when no registrations exist.
 *
 * @param {import("express").Request} req Express request containing the event ID.
 * @param {import("express").Response} res Express response indicating the result.
 * @returns {void}
 */
app.delete("/api/events/:id", (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const eventId = Number(req.params.id);
    const deleteSql = `
        DELETE FROM events
        WHERE event_id = ?
          AND NOT EXISTS (
              SELECT 1
              FROM registrations
              WHERE registrations.event_id = events.event_id
          )
    `;

    db.execute(deleteSql, [eventId], (deleteError, result) => {
        if (deleteError) {
            if (deleteError.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    message: "Cannot delete an event that has registrations"
                });
            }

            console.error("Event delete failed:", deleteError.message);
            return res.status(500).json({ message: "Unable to delete event" });
        }

        if (result.affectedRows > 0) {
            return res.json({ message: "Event deleted successfully" });
        }

        const statusSql = `
            SELECT
                e.event_id,
                COUNT(r.registration_id) AS registration_count
            FROM events e
            LEFT JOIN registrations r ON r.event_id = e.event_id
            WHERE e.event_id = ?
            GROUP BY e.event_id
        `;

        db.execute(statusSql, [eventId], (statusError, rows) => {
            if (statusError) {
                console.error("Event delete status query failed:", statusError.message);
                return res.status(500).json({ message: "Unable to delete event" });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: "Event not found" });
            }

            if (rows[0].registration_count > 0) {
                return res.status(409).json({
                    message: "Cannot delete an event that has registrations"
                });
            }

            return res.status(409).json({ message: "Event could not be deleted" });
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
