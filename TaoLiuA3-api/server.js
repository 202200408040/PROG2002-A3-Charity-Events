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

// Event details API
app.get("/api/events/:id", (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const eventId = Number(req.params.id);

    if (!Number.isSafeInteger(eventId)) {
        return sendBadRequest(res, "Invalid event ID");
    }

    const sql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.full_description,
            e.event_date,
            e.event_time,
            e.location,
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

    db.execute(sql, [eventId], (error, results) => {
        if (error) {
            console.error("Event details query failed:", error.message);
            return res.status(500).json({
                message: "Unable to retrieve event details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(results[0]);
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

