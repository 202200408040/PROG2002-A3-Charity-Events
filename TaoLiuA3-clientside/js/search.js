const categoriesUrl = "/api/categories";
const eventsUrl = "/api/events";

const searchForm = document.querySelector("#search-form");
const searchSubmit = searchForm.querySelector("button[type='submit']");
const dateInput = document.querySelector("#search-date");
const locationInput = document.querySelector("#search-location");
const categorySelect = document.querySelector("#search-category");
const clearButton = document.querySelector("#clear-filters");
const searchStatus = document.querySelector("#search-status");
const filterSummary = document.querySelector("#filter-summary");
const searchResults = document.querySelector("#search-results");
const currentYear = document.querySelector("#current-year");

function setStatus(message, isError = false) {
    searchStatus.textContent = message;
    searchStatus.classList.toggle("error", isError);
}

function setBusy(isBusy) {
    searchSubmit.disabled = isBusy;
    clearButton.disabled = isBusy;
    searchStatus.setAttribute("aria-busy", String(isBusy));
    searchResults.setAttribute("aria-busy", String(isBusy));
}

function setFilterSummary(date, location, categoryName = "") {
    const filters = [];

    if (date) {
        filters.push(`Date: ${UnityAid.formatDate(date)}`);
    }

    if (location) {
        filters.push(`Location: ${location}`);
    }

    if (categoryName) {
        filters.push(`Category: ${categoryName}`);
    }

    filterSummary.textContent = filters.length
        ? `Filters applied: ${filters.join(" | ")}`
        : "";
}

async function loadCategories() {
    categorySelect.disabled = true;

    try {
        const response = await fetch(categoriesUrl);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const categories = await response.json();

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.category_id;
            option.textContent = category.name;
            categorySelect.append(option);
        });
    } catch (error) {
        console.error("Unable to load event categories:", error);
        setStatus("Unable to load event categories.", true);
    } finally {
        categorySelect.disabled = false;
    }
}

async function searchEvents(event) {
    event.preventDefault();

    const date = dateInput.value.trim();
    const location = locationInput.value.trim();
    const category = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex].textContent;

    searchResults.replaceChildren();
    setFilterSummary(date, location, category ? categoryName : "");

    if (!date && !location && !category) {
        setFilterSummary("", "", "");
        setStatus("Please select at least one filter.", true);
        return;
    }

    const params = new URLSearchParams();

    if (date) {
        params.set("date", date);
    }

    if (location) {
        params.set("location", location);
    }

    if (category) {
        params.set("category", category);
    }

    setBusy(true);
    setStatus("Searching for events...");

    try {
        const response = await fetch(`${eventsUrl}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const events = await response.json();

        if (!Array.isArray(events) || events.length === 0) {
            setStatus("No matching events found.");
            return;
        }

        const fragment = document.createDocumentFragment();
        events.forEach((eventData) => {
            fragment.append(UnityAid.createEventCard(eventData));
        });

        searchResults.append(fragment);
        setStatus(`Found ${events.length} matching event${events.length === 1 ? "" : "s"}.`);
    } catch (error) {
        console.error("Unable to search events:", error);
        setStatus("Unable to search events. Please try again later.", true);
    } finally {
        setBusy(false);
    }
}

clearButton.addEventListener("click", () => {
    searchForm.reset();
    searchResults.replaceChildren();
    setFilterSummary("", "", "");
    setStatus("");
    dateInput.focus();
});

searchForm.addEventListener("submit", searchEvents);

currentYear.textContent = new Date().getFullYear();
loadCategories();
