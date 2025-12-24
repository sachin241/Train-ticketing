const trains = [
  { number: "101", name: "Express A", source: "City1", destination: "City2", seats: 50 },
  { number: "102", name: "Express B", source: "City3", destination: "City4", seats: 40 },
  { number: "103", name: "Express C", source: "City5", destination: "City6", seats: 60 }
];

const bookings = [];
function renderTrains(trainData) {
  const trainList = document.getElementById("trainList");
  trainList.innerHTML = "";

  if (trainData.length === 0) {
    trainList.innerHTML = "<p>No trains found.</p>";
    return;
  }

  trainData.forEach(train => {
    const card = document.createElement("div");
    card.className = "train-card";
    card.innerHTML = `
      <p><strong>${train.name}</strong> (${train.number})</p>
      <p>${train.source} ➝ ${train.destination}</p>
      <p>Seats: ${train.seats}</p>
      <button onclick="bookTrain('${train.number}')">Book</button>
    `;
    trainList.appendChild(card);
  });
}
function bookTrain(trainNumber) {
  const passenger = prompt("Enter passenger name:");
  if (!passenger) return;

  const booking = {
    passenger,
    train: trainNumber,
    seat: Math.floor(Math.random() * 100) + 1,
    date: new Date().toLocaleDateString()
  };

  bookings.push(booking);
  renderBookings();
}
function renderBookings() {
  const bookingDiv = document.getElementById("bookingHistory");
  bookingDiv.innerHTML = "";

  if (bookings.length === 0) {
    bookingDiv.innerHTML = "<p>No bookings yet.</p>";
    return;
  }

  bookings.forEach(b => {
    const card = document.createElement("div");
    card.className = "booking-card";
    card.innerHTML = `
      <p><strong>${b.passenger}</strong> booked Train ${b.train}</p>
      <p>Seat: ${b.seat} | Date: ${b.date}</p>
    `;
    bookingDiv.appendChild(card);
  });
}
function searchTrains() {
  const source = document.getElementById("source").value.trim().toLowerCase();
  const destination = document.getElementById("destination").value.trim().toLowerCase();

  const filtered = trains.filter(train =>
    train.source.toLowerCase().includes(source) &&
    train.destination.toLowerCase().includes(destination)
  );

  renderTrains(filtered);
}
document.getElementById("searchBtn").addEventListener("click", searchTrains);

window.onload = () => {
  renderTrains(trains);
  renderBookings();
};