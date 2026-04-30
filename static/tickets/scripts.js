const trainListDiv = document.getElementById("trainList");
const bookingHistoryDiv = document.getElementById("bookingHistory");
const searchBtn = document.getElementById("searchBtn");
const statusMessage = document.getElementById("statusMessage");
const sourceInput = document.getElementById("source");
const destinationInput = document.getElementById("destination");

function setStatus(message, tone = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (tone) {
    statusMessage.classList.add(`is-${tone}`);
  }
}

function renderEmptyState(container, message) {
  container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

async function loadTrains(source = "", destination = "") {
  let url = "/trains/";

  if (source && destination) {
    url += `?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
  }

  const res = await fetch(url);
  const trains = await res.json();

  trainListDiv.innerHTML = "";

  if (trains.length === 0) {
    renderEmptyState(trainListDiv, "No trains matched this route search.");
    return;
  }

  trains.forEach((train) => {
    const div = document.createElement("article");
    div.className = "train-card";

    div.innerHTML = `
      <div class="train-card-header">
        <div>
          <h3>${escapeHtml(train.train_name)}</h3>
          <p class="train-number">Train ${escapeHtml(train.train_number)}</p>
        </div>
        <span class="seat-badge">${escapeHtml(train.available_seats)} seats available</span>
      </div>
      <p class="route-line">${escapeHtml(train.source)} to ${escapeHtml(train.destination)}</p>
      <form class="booking-form" data-train-id="${train.id}">
        <input type="text" name="passengerName" placeholder="Passenger name" aria-label="Passenger name for ${escapeHtml(train.train_name)}">
        <button class="book-button" type="submit" ${train.available_seats === 0 ? "disabled" : ""}>Reserve seat</button>
      </form>
    `;

    const form = div.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const passengerName = form.elements.passengerName.value.trim();
      bookTicket(train.id, passengerName, form);
    });

    trainListDiv.appendChild(div);
  });
}

async function bookTicket(trainId, passengerName, form) {
  if (!passengerName) {
    setStatus("Enter a passenger name before creating a booking.", "error");
    return;
  }

  const submitButton = form.querySelector("button");
  submitButton.disabled = true;
  submitButton.textContent = "Processing...";
  setStatus("Submitting booking request...");

  const res = await fetch("/book/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      passenger_name: passengerName,
      train_id: trainId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    submitButton.disabled = false;
    submitButton.textContent = "Reserve seat";
    setStatus(data.error || "Booking failed. Please try again.", "error");
    return;
  }

  form.reset();
  setStatus(`Booking confirmed. Seat ${data.seat_number} has been assigned.`, "success");

  await Promise.all([
    loadTrains(sourceInput.value.trim(), destinationInput.value.trim()),
    loadBookings(),
  ]);
}

async function loadBookings() {
  const res = await fetch("/bookings/");
  const bookings = await res.json();

  bookingHistoryDiv.innerHTML = "";

  if (bookings.length === 0) {
    renderEmptyState(bookingHistoryDiv, "Confirmed reservations will appear here.");
    return;
  }

  bookings.forEach((booking) => {
    const div = document.createElement("article");
    div.className = "booking-card";

    div.innerHTML = `
      <div class="booking-card-header">
        <div>
          <h3>${escapeHtml(booking.passenger_name)}</h3>
          <p class="booking-meta">${escapeHtml(booking.train_name)}</p>
        </div>
        <span class="booking-chip">Confirmed</span>
      </div>
      <p><span class="muted">Seat</span> ${escapeHtml(booking.seat_number)}</p>
      <p><span class="muted">Booked on</span> ${escapeHtml(booking.booking_date)}</p>
    `;

    bookingHistoryDiv.appendChild(div);
  });
}

searchBtn.addEventListener("click", async () => {
  const source = sourceInput.value.trim();
  const destination = destinationInput.value.trim();

  if (!source || !destination) {
    setStatus("Enter both source and destination station codes to search.", "error");
    return;
  }

  setStatus("Searching available trains...");
  await loadTrains(source, destination);
  setStatus(`Showing results for ${source} to ${destination}.`);
});

loadTrains();
loadBookings();
