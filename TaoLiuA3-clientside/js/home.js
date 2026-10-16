const homeApiUrl = "/api/events/home";


const eventsGrid = document.querySelector("#events-grid");
const statusMessage = document.querySelector("#event-status");
const impactRaised = document.querySelector("#impact-raised");
const impactEvents = document.querySelector("#impact-events");
const currentYear = document.querySelector("#current-year");

function setEventStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
}

async function loadHomepageEvents() {
    eventsGrid.setAttribute("aria-busy", "true");
    setEventStatus("Loading events...");
    eventsGrid.replaceChildren();

    try {
        const response = await fetch(homeApiUrl);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const events = await response.json();

        if (!Array.isArray(events) || events.length === 0) {
            setEventStatus("No upcoming events are currently available.");
            return;
        }

        const fragment = document.createDocumentFragment();
        events.forEach((event) => {
            fragment.append(UnityAid.createEventCard(event));
        });

        eventsGrid.append(fragment);
        setEventStatus(`Showing ${events.length} upcoming events.`);
    } catch (error) {
        console.error("Unable to load homepage events:", error);
        setEventStatus("Unable to load events. Please try again later.", true);
    } finally {
        eventsGrid.setAttribute("aria-busy", "false");
    }
}

async function loadImpactStatistics() {
    try {
        const response = await fetch(homeApiUrl);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const events = await response.json();
        const totalRaised = events.reduce(
            (sum, event) => sum + Number(event.current_amount || 0),
            0
        );

        impactRaised.textContent = UnityAid.formatCompactCurrency(totalRaised);
        impactEvents.textContent = events.length;
    } catch (error) {
        console.error("Unable to load impact statistics:", error);
        impactRaised.textContent = "-";
        impactEvents.textContent = "-";
    }
}

currentYear.textContent = new Date().getFullYear();
loadHomepageEvents();
loadImpactStatistics();


