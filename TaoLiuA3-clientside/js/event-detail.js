const detailStatus = document.querySelector("#detail-status");
const eventDetail = document.querySelector("#event-detail");
const detailImage = document.querySelector("#detail-image");
const detailCategory = document.querySelector("#detail-category");
const detailName = document.querySelector("#detail-name");
const detailOrganisation = document.querySelector("#detail-organisation");
const detailDate = document.querySelector("#detail-date");
const detailTime = document.querySelector("#detail-time");
const detailLocation = document.querySelector("#detail-location");
const detailPrice = document.querySelector("#detail-price");
const detailDescription = document.querySelector("#detail-description");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const progressPercentage = document.querySelector("#progress-percentage");
const fundraisingAmounts = document.querySelector("#fundraising-amounts");
const registerButton = document.querySelector("#register-button");
const registrationModal = document.querySelector("#registration-modal");
const modalClose = document.querySelector("#modal-close");
const modalConfirm = document.querySelector("#modal-confirm");
const currentYear = document.querySelector("#current-year");

function setStatus(message, isError = false) {
    detailStatus.textContent = message;
    detailStatus.classList.toggle("error", isError);
    detailStatus.hidden = false;
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function formatTime(timeString) {
    return timeString.slice(0, 5);
}

function formatPrice(value) {
    const price = Number(value);

    if (price === 0) {
        return "Free";
    }

    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD"
    }).format(price);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0
    }).format(Number(value));
}

function renderEvent(event) {
    const goal = Number(event.fundraising_goal);
    const currentAmount = Number(event.current_amount);
    const progress = goal > 0
        ? Math.min(100, Math.round((currentAmount / goal) * 100))
        : 0;

    detailImage.src = event.image_url || "";
    detailImage.alt = `${event.name} event image`;
    detailCategory.textContent = event.category;
    detailName.textContent = event.name;
    detailOrganisation.textContent = `Hosted by ${event.organisation}`;
    detailDate.textContent = formatDate(event.event_date);
    detailTime.textContent = formatTime(event.event_time);
    detailLocation.textContent = event.location;
    detailPrice.textContent = formatPrice(event.ticket_price);
    detailDescription.textContent = event.full_description;
    progressFill.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", String(progress));
    progressPercentage.textContent = `${progress}% funded`;
    fundraisingAmounts.textContent = `${formatCurrency(currentAmount)} raised of ${formatCurrency(goal)}`;

    detailStatus.hidden = true;
    eventDetail.hidden = false;
}

function openModal() {
    registrationModal.hidden = false;
    document.body.classList.add("modal-open");
    modalConfirm.focus();
}

function closeModal() {
    registrationModal.hidden = true;
    document.body.classList.remove("modal-open");
    registerButton.focus();
}

async function loadEvent() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!eventId) {
        setStatus("No event ID was provided.", true);
        return;
    }

    if (!/^\d+$/.test(eventId) || Number(eventId) <= 0) {
        setStatus("Invalid event ID.", true);
        return;
    }

    setStatus("Loading event details...");

    try {
        const response = await fetch(`/api/events/${encodeURIComponent(eventId)}`);

        if (response.status === 404) {
            setStatus("Event not found.", true);
            return;
        }

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const event = await response.json();
        renderEvent(event);
    } catch (error) {
        console.error(error);
        setStatus("Unable to load event details. Please try again later.", true);
    }
}

registerButton.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalConfirm.addEventListener("click", closeModal);
registrationModal.querySelector("[data-close-modal]").addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !registrationModal.hidden) {
        closeModal();
    }
});

currentYear.textContent = new Date().getFullYear();
loadEvent();
