document.addEventListener("DOMContentLoaded", function () {
    const cart = JSON.parse(localStorage.getItem("flightCart"));
    const cartDetailsTable = document.getElementById("cartFlightDetails");
    const priceBreakdownTable = document.getElementById("priceBreakdownTable");
    const passengerInputsContainer = document.getElementById("passengerInputs");
    const bookingConfirmation = document.getElementById("bookingConfirmation");
    const confirmationDetails = document.getElementById("confirmationDetails");

    if (!cart || cart.length === 0) {
        alert("Your cart is empty. Redirecting to flights page.");
        window.location.href = "flights.html";
        return;
    }

    const adults = parseInt(localStorage.getItem("adults")) || 0;
    const children = parseInt(localStorage.getItem("children")) || 0;
    const infants = parseInt(localStorage.getItem("infants")) || 0;
    const totalPassengers = adults + children + infants;

    const flight = cart[0];
    const adultPrice = flight.price;
    const childPrice = adultPrice * 0.7;
    const infantPrice = adultPrice * 0.1;
    const totalPrice = (adults * adultPrice + children * childPrice + infants * infantPrice).toFixed(2);

    cartDetailsTable.innerHTML = `
    <tr>
        <td>${flight.flightId}</td>
        <td>${flight.origin}</td> <!-- Display origin -->
        <td>${flight.destination}</td> <!-- Display destination -->
        <td>${flight.departureDate} ${flight.departureTime}</td>
        <td>${flight.arrivalDate} ${flight.arrivalTime}</td>
        <td>${totalPassengers}</td>
        <td>$${totalPrice}</td>
    </tr>
`;


    priceBreakdownTable.innerHTML = `
        <tr>
            <td>Adults</td>
            <td>${adults}</td>
            <td>$${adultPrice.toFixed(2)}</td>
            <td>$${(adults * adultPrice).toFixed(2)}</td>
        </tr>
        <tr>
            <td>Children</td>
            <td>${children}</td>
            <td>$${childPrice.toFixed(2)}</td>
            <td>$${(children * childPrice).toFixed(2)}</td>
        </tr>
        <tr>
            <td>Infants</td>
            <td>${infants}</td>
            <td>$${infantPrice.toFixed(2)}</td>
            <td>$${(infants * infantPrice).toFixed(2)}</td>
        </tr>
    `;

    for (let i = 1; i <= totalPassengers; i++) {
        passengerInputsContainer.innerHTML += `
            <fieldset>
                <legend>Passenger ${i}</legend>
                <label for="firstName${i}">First Name:</label>
                <input type="text" id="firstName${i}" name="firstName${i}" required><br>

                <label for="lastName${i}">Last Name:</label>
                <input type="text" id="lastName${i}" name="lastName${i}" required><br>

                <label for="dob${i}">Date of Birth:</label>
                <input type="date" id="dob${i}" name="dob${i}" required><br>

                <label for="ssn${i}">SSN:</label>
                <input type="text" id="ssn${i}" name="ssn${i}" required pattern="\\d{3}-\\d{2}-\\d{4}" title="SSN format: 123-45-6789"><br>
            </fieldset>
        `;
    }

    document.getElementById("passengerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const passengers = [];
        for (let i = 1; i <= totalPassengers; i++) {
            const passenger = {
                firstName: document.getElementById(`firstName${i}`).value.trim(),
                lastName: document.getElementById(`lastName${i}`).value.trim(),
                dob: document.getElementById(`dob${i}`).value.trim(),
                ssn: document.getElementById(`ssn${i}`).value.trim(),
            };
            passengers.push(passenger);
        }

        const bookingNumber = `BK-${Date.now()}`;
        flight.availableSeats -= totalPassengers;

        bookingConfirmation.style.display = "block";
        confirmationDetails.innerHTML = `
            <p>Booking Number: ${bookingNumber}</p>
            <p>Flight ID: ${flight.flightId}</p>
            <p>Origin: ${flight.origin}</p>
            <p>Destination: ${flight.destination}</p>
            <p>Departure: ${flight.departureDate} ${flight.departureTime}</p>
            <p>Arrival: ${flight.arrivalDate} ${flight.arrivalTime}</p>
            <h4>Passengers:</h4>
            <ul>
                ${passengers.map(p => `<li>${p.firstName} ${p.lastName} (DOB: ${p.dob}, SSN: ${p.ssn})</li>`).join("")}
            </ul>
            <button id="backToHome">Back to Homepage</button>
        `;
        fetch('update_flight_seats.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                flightId: flight.flightId,
                seatsBooked: totalPassengers
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Seats updated successfully in the XML file.');
                } else {
                    console.error('Error updating seats:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        // Attach navigation handler to the button
        document.getElementById("backToHome").addEventListener("click", function () {
            window.location.href = "index.html";
        });

        localStorage.removeItem("flightCart");
        localStorage.removeItem("adults");
        localStorage.removeItem("children");
        localStorage.removeItem("infants");
    });
});
