// Shared event card rendering for the homepage and search page.
(function () {
    function formatDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);

        return new Intl.DateTimeFormat("en-AU", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(new Date(year, month - 1, day));
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

    function formatCompactCurrency(value) {
        const amount = Number(value);

        if (amount >= 1000) {
            return `$${Math.round(amount / 1000)}K+`;
        }

        return `$${Math.round(amount)}`;
    }

    function createMeta(label, value) {
        const row = document.createElement("span");
        const labelElement = document.createElement("strong");
        const valueElement = document.createElement("span");

        labelElement.textContent = `${label}:`;
        valueElement.textContent = value;
        row.append(labelElement, valueElement);

        return row;
    }

    function createEventCard(event) {
        const card = document.createElement("article");
        const imageWrap = document.createElement("div");
        const image = document.createElement("img");
        const category = document.createElement("span");
        const body = document.createElement("div");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        const meta = document.createElement("div");
        const footer = document.createElement("div");
        const price = document.createElement("span");
        const link = document.createElement("a");

        card.className = "event-card";
        imageWrap.className = "event-card__image-wrap";
        image.className = "event-card__image";
        category.className = "event-card__category";
        body.className = "event-card__body";
        description.className = "event-card__description";
        meta.className = "event-meta";
        footer.className = "event-card__footer";
        price.className = "event-price";
        link.className = "event-link";

        image.src = event.image_url || "";
        image.alt = `${event.name} event image`;
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove());

        category.textContent = event.category;
        title.textContent = event.name;
        description.textContent = event.short_description;
        price.textContent = formatPrice(event.ticket_price);

        meta.append(
            createMeta("Date", formatDate(event.event_date)),
            createMeta("Location", event.location)
        );

        link.href = `event.html?id=${encodeURIComponent(event.event_id)}`;
        link.textContent = "View Details";

        imageWrap.append(image, category);
        footer.append(price, link);
        body.append(title, description, meta, footer);
        card.append(imageWrap, body);

        return card;
    }

    window.UnityAid = {
        createEventCard,
        formatCompactCurrency,
        formatDate,
        formatPrice
    };
})();
