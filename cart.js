// Utility function to generate a unique booking number
function generateBookingNumber() {
    return 'BK-' + Math.floor(Math.random() * 1000000);
}

// Load flight details from LocalStorage


// Function to load flight details from localStorage
// Function to load flight details from localStorage
function loadFlightDetails() {
    // Retrieve the cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('flightCart')) || [];

    // Check if the cart is empty
    if (cart.length === 0) {
        document.getElementById('flight-details').innerHTML = '<p>No flights in your cart.</p>';
        return;
    }

    // Generate HTML content for each flight in the cart
    let flightDetailsHTML = '<table class="flights-table"><thead><tr>' +
        '<th>Flight ID</th><th>Origin</th><th>Destination</th>' +
        '<th>Departure Date</th><th>Arrival Date</th>' +
        '<th>Departure Time</th><th>Arrival Time</th><th>Price</th></tr></thead><tbody>';

    cart.forEach(flight => {
        // Safely access the price field and handle undefined values
        const price = flight.price ? parseFloat(flight.price).toFixed(2) : '0.00';

        flightDetailsHTML += `
            <tr>
                <td>${flight.flightId || ''}</td>
                <td>${flight.origin || ''}</td>
                <td>${flight.destination || ''}</td>
                <td>${flight.departureDate || ''}</td>
                <td>${flight.arrivalDate || ''}</td>
                <td>${flight.departureTime || ''}</td>
                <td>${flight.arrivalTime || ''}</td>
                <td>$${price}</td>
            </tr>
        `;
    });

    flightDetailsHTML += '</tbody></table>';

    // Display the flight details in the flight-details div
    document.getElementById('flight-details').innerHTML = flightDetailsHTML;
}

// Load flight details when the page loads
document.addEventListener('DOMContentLoaded', loadFlightDetails);



// Load flight details when the page loads


// Load flight details when the page loads
document.addEventListener('DOMContentLoaded', loadFlightDetails);

// Render dynamic passenger form
function renderPassengerForm(adults, children, infants) {
    const passengerInfo = document.getElementById('passenger-info');
    passengerInfo.innerHTML = '';

    const totalPassengers = adults + children + infants;
    for (let i = 0; i < totalPassengers; i++) {
        passengerInfo.innerHTML += `
            <div class="passenger">
                <h4>Passenger ${i + 1}</h4>
                <label>First Name:</label>
                <input type="text" id="firstName${i}" required><br>
                <label>Last Name:</label>
                <input type="text" id="lastName${i}" required><br>
                <label>Date of Birth:</label>
                <input type="date" id="dob${i}" required><br>
                <label>SSN:</label>
                <input type="text" id="ssn${i}" required><br>
            </div>
        `;
    }
}

// Handle booking submission
function bookFlight(event) {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('flightCart'));
    const flight = cart[0]; // Assuming one flight in the cart
    const bookingNumber = generateBookingNumber();

    const adults = parseInt(localStorage.getItem('adults')) || 1;
    const children = parseInt(localStorage.getItem('children')) || 0;
    const infants = parseInt(localStorage.getItem('infants')) || 0;
    const totalPassengers = adults + children + infants;

    const passengers = [];
    for (let i = 0; i < totalPassengers; i++) {
        const firstName = document.getElementById(`firstName${i}`).value;
        const lastName = document.getElementById(`lastName${i}`).value;
        const dob = document.getElementById(`dob${i}`).value;
        const ssn = document.getElementById(`ssn${i}`).value;

        passengers.push({
            firstName,
            lastName,
            dob,
            ssn
        });
    }

    // Display booking confirmation
    displayBookingConfirmation(bookingNumber, flight, passengers);

    // Clear cart after booking
    localStorage.removeItem('flightCart');
}

// Display booking confirmation
function displayBookingConfirmation(bookingNumber, flight, passengers) {
    const bookingConfirmation = document.getElementById('booking-confirmation');
    bookingConfirmation.style.display = 'block';

    document.getElementById('booking-number').textContent = `Booking Number: ${bookingNumber}`;

    // Display booked flight details
    const bookedFlight = `
        <p><strong>Flight ID:</strong> ${flight.flightId}</p>
        <p><strong>Origin:</strong> ${flight.departure}</p>
        <p><strong>Destination:</strong> ${flight.arrival}</p>
        <p><strong>Departure Date:</strong> ${flight.departureDate}</p>
        <p><strong>Arrival Date:</strong> ${flight.arrivalDate}</p>
        <p><strong>Departure Time:</strong> ${flight.departureTime}</p>
        <p><strong>Arrival Time:</strong> ${flight.arrivalTime}</p>
    `;
    document.getElementById('booked-flight').innerHTML = bookedFlight;

    // Display passenger details
    const bookedPassengers = passengers.map((passenger, index) => `
        <div class="passenger-info">
            <h4>Passenger ${index + 1}</h4>
            <p><strong>SSN:</strong> ${passenger.ssn}</p>
            <p><strong>Name:</strong> ${passenger.firstName} ${passenger.lastName}</p>
            <p><strong>Date of Birth:</strong> ${passenger.dob}</p>
        </div>
    `).join('');
    document.getElementById('booked-passengers').innerHTML = bookedPassengers;

    alert('Booking successful! Your booking number is ' + bookingNumber);
}

// Event listener for form submission
document.getElementById('passenger-form').addEventListener('submit', bookFlight);

// Load flight details on page load
document.addEventListener('DOMContentLoaded', loadFlightDetails);
