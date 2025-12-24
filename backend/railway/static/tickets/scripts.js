const trainListDiv = document.getElementById("trainList");
const bookingHistoryDiv = document.getElementById("bookingHistory");
const searchBtn = document.getElementById("searchBtn");

const sourceInput = document.getElementById("source");
const destinationInput = document.getElementById("destination");

/* -------------------------------
   LOAD ALL TRAINS (ON PAGE LOAD)
-------------------------------- */
async function loadTrains(source = "", destination = "") {
  let url = "/trains/";

  if (source && destination) {
    url += `?source=${source}&destination=${destination}`;
  }

  const res = await fetch(url);
  const trains = await res.json();

  trainListDiv.innerHTML = "";

  if (trains.length === 0) {
    trainListDiv.innerHTML = "<p>No trains found.</p>";
    return;
  }

  trains.forEach(train => {
    const div = document.createElement("div");
    div.className = "train-card";

    div.innerHTML = `
      <h3>${train.train_name} (${train.train_number})</h3>
      <p>${train.source} → ${train.destination}</p>
      <p>Available Seats: ${train.available_seats}</p>
      <input type="text" placeholder="Passenger Name" id="name-${train.id}">
      <button ${train.available_seats === 0 ? "disabled" : ""} 
              onclick="bookTicket(${train.id})">
        Book
      </button>
    `;

    trainListDiv.appendChild(div);
  });
}

/* -------------------------------
   BOOK TICKET
-------------------------------- */
async function bookTicket(trainId) {
  const nameInput = document.getElementById(`name-${trainId}`);
  const passengerName = nameInput.value.trim();

  if (!passengerName) {
    alert("Enter passenger name");
    return;
  }

  const res = await fetch("/book/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      passenger_name: passengerName,
      train_id: trainId
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Booking failed");
    return;
  }

  alert(`Booked! Seat No: ${data.seat_number}`);

  nameInput.value = "";

  loadTrains(sourceInput.value, destinationInput.value);
  loadBookings();
}

/* -------------------------------
   LOAD BOOKINGS
-------------------------------- */
async function loadBookings() {
  const res = await fetch("/bookings/");
  const bookings = await res.json();

  bookingHistoryDiv.innerHTML = "";

  if (bookings.length === 0) {
    bookingHistoryDiv.innerHTML = "<p>No bookings yet.</p>";
    return;
  }

  bookings.forEach(b => {
    const div = document.createElement("div");
    div.className = "booking-card";

    div.innerHTML = `
      <p><strong>${b.passenger_name}</strong></p>
      <p>${b.train_name}</p>
      <p>Seat: ${b.seat_number}</p>
      <p>${b.booking_date}</p>
      <hr>
    `;

    bookingHistoryDiv.appendChild(div);
  });
}

/* -------------------------------
   SEARCH BUTTON
-------------------------------- */
searchBtn.addEventListener("click", () => {
  const source = sourceInput.value.trim();
  const destination = destinationInput.value.trim();

  if (!source || !destination) {
    alert("Enter both source and destination station codes");
    return;
  }

  loadTrains(source, destination);
});

/* -------------------------------
   INITIAL LOAD
-------------------------------- */
loadTrains();
loadBookings();
