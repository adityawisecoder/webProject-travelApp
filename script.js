// Utility function to convert dd-mm-yyyy to yyyy-mm-dd
function normalizeDate(dateString) {
    // Input is dd-mm-yyyy, output should be yyyy-mm-dd
    const [day, month, year] = dateString.split('-');
    // Pad single digits with leading zeros
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
}

function formatDateForDisplay(dateString) {
    // Input is yyyy-mm-dd, output should be dd-mm-yyyy
    const [year, month, day] = dateString.split('-');
    // Pad single digits with leading zeros
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${paddedDay}-${paddedMonth}-${year}`;
}

function parseAndFilterFlights(xmlString, searchCriteria) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const flights = xmlDoc.getElementsByTagName("Flight");
    const filteredFlights = [];
    
    // Convert search date to Date object for comparison
    // searchCriteria.departureDate is already in yyyy-mm-dd format after normalizeDate
    const searchDate = new Date(searchCriteria.departureDate);
    const threeDaysBefore = new Date(searchDate);
    threeDaysBefore.setDate(searchDate.getDate() - 3);
    const threeDaysAfter = new Date(searchDate);
    threeDaysAfter.setDate(searchDate.getDate() + 3);
    
    const totalPassengers = parseInt(searchCriteria.adults) + 
                          parseInt(searchCriteria.children) + 
                          parseInt(searchCriteria.infants);

    for (let flight of flights) {
        const flightData = {
            flightId: flight.getElementsByTagName("FlightID")[0].textContent,
            origin: flight.getElementsByTagName("Origin")[0].textContent,
            destination: flight.getElementsByTagName("Destination")[0].textContent,
            departureDate: flight.getElementsByTagName("DepartureDate")[0].textContent, // Already yyyy-mm-dd in XML
            arrivalDate: flight.getElementsByTagName("ArrivalDate")[0].textContent,
            departureTime: flight.getElementsByTagName("DepartureTime")[0].textContent,
            arrivalTime: flight.getElementsByTagName("ArrivalTime")[0].textContent,
            availableSeats: parseInt(flight.getElementsByTagName("AvailableSeats")[0].textContent),
            price: parseFloat(flight.getElementsByTagName("Price")[0].textContent)
        };

        if (flightData.origin.toLowerCase() === searchCriteria.origin.toLowerCase() &&
            flightData.destination.toLowerCase() === searchCriteria.destination.toLowerCase()) {
            
            // XML date is already in yyyy-mm-dd format, so we can create Date object directly
            const flightDate = new Date(flightData.departureDate);
            
            if (flightData.availableSeats >= totalPassengers) {
                if (flightDate >= threeDaysBefore && flightDate <= threeDaysAfter) {
                    filteredFlights.push(flightData);
                }
            }
        }
    }
    
    return filteredFlights;
}

function displayAvailableFlights(flights, searchDate) {
    const displayInfo = document.getElementById('displayInfo');
    const flightsContainer = document.createElement('div');
    flightsContainer.id = 'availableFlights';
    flightsContainer.className = 'available-flights';

    if (flights.length === 0) {
        flightsContainer.innerHTML = `
            <h3>No Available Flights</h3>
            <p>No flights found within 3 days of ${searchDate}</p>
        `;
    } else {
        flightsContainer.innerHTML = `
            <h3>Available Flights</h3>
            <table class="flights-table">
                <thead>
                    <tr>
                        <th>Flight ID</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Available Seats</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${flights.map(flight => `
                        <tr>
                            <td>${flight.flightId}</td>
                            <td>${flight.departureDate} ${flight.departureTime}</td>
                            <td>${flight.arrivalDate} ${flight.arrivalTime}</td>
                            <td>${flight.availableSeats}</td>
                            <td>$${flight.price}</td>
                            <td>
                                <button onclick="addToCart('${flight.flightId}')" class="add-to-cart-btn">
                                    Add to Cart
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Remove existing flights display if any
    const existingFlights = document.getElementById('availableFlights');
    if (existingFlights) {
        existingFlights.remove();
    }

    displayInfo.appendChild(flightsContainer);
    displayInfo.style.display = 'block';
}


function addToCart(flightId) {
    const selectedFlightRow = document.querySelector(`button[onclick="addToCart('${flightId}')"]`).closest("tr");
    const flightDetails = {
        flightId,
        origin: document.getElementById("origin").value.trim(), // Retrieve origin from the input field
        destination: document.getElementById("destination").value.trim(), // Retrieve destination from the input field
        departureDate: selectedFlightRow.cells[1].textContent.split(" ")[0],
        departureTime: selectedFlightRow.cells[1].textContent.split(" ")[1],
        arrivalDate: selectedFlightRow.cells[2].textContent.split(" ")[0],
        arrivalTime: selectedFlightRow.cells[2].textContent.split(" ")[1],
        availableSeats: parseInt(selectedFlightRow.cells[3].textContent),
        price: parseFloat(selectedFlightRow.cells[4].textContent.replace("$", ""))
    };

    const adults = parseInt(document.getElementById("adults").value);
    const children = parseInt(document.getElementById("children").value);
    const infants = parseInt(document.getElementById("infants").value);
    const totalPassengers = adults + children + infants;

    if (totalPassengers > flightDetails.availableSeats) {
        alert("Not enough available seats for the selected number of passengers.");
        return;
    }

    localStorage.setItem("flightCart", JSON.stringify([flightDetails]));
    localStorage.setItem("adults", adults);
    localStorage.setItem("children", children);
    localStorage.setItem("infants", infants);

    alert(`Flight ${flightId} has been added to your cart.`);
    window.location.href = "cart_flights.html";
}




document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const fontSizeSelect = document.getElementById('font-size');
    const themeSelect = document.getElementById('bg-color');
    const mainContent = document.querySelector('.main-content');
    const dateTimeElement = document.getElementById('date-time');
    // Define color themes
    const themes = {
        'default': {
            header: '#333',
            nav: '#444',
            sidebar: '#f4f4f4',
            mainContent: '#ffffff',
            footer: '#333',
            headerText: '#ffffff',
            navText: '#ffffff',
            mainText: '#000000',
            footerText: '#ffffff',
            linkHover: '#555'
        },
        'light-blue': {
            header: '#2c3e50',
            nav: '#3498db',
            sidebar: '#ebf5fb',
            mainContent: '#ffffff',
            footer: '#2c3e50',
            headerText: '#ffffff',
            navText: '#ffffff',
            mainText: '#2c3e50',
            footerText: '#ffffff',
            linkHover: '#2980b9'
        },
        'light-green': {
            header: '#2e7d32',
            nav: '#4caf50',
            sidebar: '#e8f5e9',
            mainContent: '#ffffff',
            footer: '#2e7d32',
            headerText: '#ffffff',
            navText: '#ffffff',
            mainText: '#2e7d32',
            footerText: '#ffffff',
            linkHover: '#388e3c'
        },
        'light-grey': {
            header: '#424242',
            nav: '#616161',
            sidebar: '#f5f5f5',
            mainContent: '#ffffff',
            footer: '#424242',
            headerText: '#ffffff',
            navText: '#ffffff',
            mainText: '#424242',
            footerText: '#ffffff',
            linkHover: '#757575'
        },
        'darker-grey': {
            header: '#212121',
            nav: '#424242',
            sidebar: '#e0e0e0',
            mainContent: '#f5f5f5',
            footer: '#212121',
            headerText: '#ffffff',
            navText: '#ffffff',
            mainText: '#212121',
            footerText: '#ffffff',
            linkHover: '#616161'
        }
    };

    // Function to apply theme
    function applyTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;

        // Apply colors to elements
        const header = document.querySelector('.header');
        const nav = document.querySelector('.nav');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const footer = document.querySelector('.footer');

        if (header) {
            header.style.backgroundColor = theme.header;
            header.style.color = theme.headerText;
        }

        if (nav) {
            nav.style.backgroundColor = theme.nav;
            const navLinks = nav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.style.color = theme.navText;
                // Update hover state in CSS
                const style = document.createElement('style');
                style.textContent = `
                    .nav a:hover {
                        background-color: ${theme.linkHover} !important;
                    }
                `;
                document.head.appendChild(style);
            });
        }

        if (sidebar) {
            sidebar.style.backgroundColor = theme.sidebar;
        }

        if (mainContent) {
            mainContent.style.backgroundColor = theme.mainContent;
            mainContent.style.color = theme.mainText;
        }

        if (footer) {
            footer.style.backgroundColor = theme.footer;
            footer.style.color = theme.footerText;
        }

        // Save theme preference
        localStorage.setItem('preferredTheme', themeName);
    }

    // Apply saved settings on page load
    function applySavedSettings() {
        // Apply saved font size
        const savedFontSize = localStorage.getItem('preferredFontSize');
        if (savedFontSize && mainContent) {
            mainContent.style.fontSize = savedFontSize;
            if (fontSizeSelect) {
                fontSizeSelect.value = savedFontSize;
            }
        }

        // Apply saved theme
        const savedTheme = localStorage.getItem('preferredTheme');
        if (savedTheme) {
            applyTheme(savedTheme);
            if (themeSelect) {
                // Map theme names to select values
                const themeMapping = {
                    'default': '#ffffff',
                    'light-blue': '#d3e4ff',
                    'light-green': '#d3ffd3',
                    'light-grey': '#f4f4f4',
                    'darker-grey': '#e0e0e0'
                };
                themeSelect.value = themeMapping[savedTheme];
            }
        }
    }

    // Font size change handler
    if (fontSizeSelect && mainContent) {
        fontSizeSelect.addEventListener('change', function() {
            const selectedSize = this.value;
            mainContent.style.fontSize = selectedSize;
            localStorage.setItem('preferredFontSize', selectedSize);
        });
    }

    // Theme change handler
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            // Map select values to theme names
            const valueToTheme = {
                '#ffffff': 'default',
                '#d3e4ff': 'light-blue',
                '#d3ffd3': 'light-green',
                '#f4f4f4': 'light-grey',
                '#e0e0e0': 'darker-grey'
            };
            const selectedTheme = valueToTheme[this.value];
            applyTheme(selectedTheme);
        });
    }

    // Date time update function
    function updateDateTime() {
        if (dateTimeElement) {
            const now = new Date();
            const formattedDateTime = now.toLocaleString();
            dateTimeElement.textContent = `Current Local Date & Time: ${formattedDateTime}`;
        }
    }

    function validateStay() {
        const city = document.getElementById("city").value;
        const checkInDate = new Date(document.getElementById("checkInDate").value);
        const checkOutDate = new Date(document.getElementById("checkOutDate").value);
        const adults = parseInt(document.getElementById("adults").value);
        const children = parseInt(document.getElementById("children").value);
        const infants = parseInt(document.getElementById("infants").value);
    
        const validCities = ["Austin", "Dallas", "Houston", "San Antonio", "Los Angeles", "San Francisco"];
        const minDate = new Date("2024-09-01");
        const maxDate = new Date("2024-12-01");
    
        let isValid = true;
        let errorMessage = "";
    
        // City validation
        if (!validCities.includes(city)) {
            isValid = false;
            errorMessage += "City must be in Texas or California.\n";
        }
    
        // Date validation
        if (checkInDate < minDate || checkInDate > maxDate || checkOutDate < minDate || checkOutDate > maxDate || checkInDate >= checkOutDate) {
            isValid = false;
            errorMessage += "Check-in and check-out dates must be between Sep 1, 2024, and Dec 1, 2024.\n";
        }
    
        // Guests validation
        if ((adults + children) > 2 && infants === 0) {
            isValid = false;
            errorMessage += "A room can have at most 2 guests excluding infants.\n";
        }
    
        if (isValid) {
            const roomsNeeded = Math.ceil((adults + children) / 2);
            document.getElementById("output").innerText = `Booking Details:\nCity: ${city}\nCheck-in: ${checkInDate.toLocaleDateString()}\nCheck-out: ${checkOutDate.toLocaleDateString()}\nAdults: ${adults}\nChildren: ${children}\nInfants: ${infants}\nRooms Needed: ${roomsNeeded}`;
        } else {
            alert(errorMessage);
        }
    }
    

    // Update date/time every second
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Apply saved settings when page loads
    applySavedSettings();

    const tripTypeSelect = document.getElementById('tripType');
    const returnDateContainer = document.getElementById('returnDateContainer');
    const passengerIcon = document.getElementById('passengerIcon');
    const passengerForm = document.getElementById('passengerForm');
    const closePassengerForm = document.getElementById('closePassengerForm');
    const flightForm = document.getElementById('flightForm');

    // Show/hide return date based on trip type
    if (tripTypeSelect) {
        tripTypeSelect.addEventListener('change', function() {
            if (this.value === 'round-trip') {
                returnDateContainer.style.display = 'block';
                document.getElementById('returnDate').required = true;
            } else {
                returnDateContainer.style.display = 'none';
                document.getElementById('returnDate').required = false;
            }
        });
    }

    // Show/hide passenger form
    if (passengerIcon && passengerForm && closePassengerForm) {
        passengerIcon.addEventListener('click', function() {
            passengerForm.style.display = 'block';
        });

        closePassengerForm.addEventListener('click', function() {
            passengerForm.style.display = 'none';
        });
    }

    // Flight form submission and validation
    if (flightForm) {
        flightForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
    
            console.log('Form submitted. Starting validation...');
    
            // Get values from form fields
            const tripType = document.getElementById('tripType').value;
            console.log('Trip Type:', tripType);
    
            const origin = document.getElementById('origin').value.trim();
            const destination = document.getElementById('destination').value.trim();
            console.log('Origin:', origin, 'Destination:', destination);
    
            const departureDateInput = document.getElementById('departureDate').value.trim();
            console.log('Raw Departure Date Input (yyyy-mm-dd):', departureDateInput);
    
            const departureDate = departureDateInput; // Already in yyyy-mm-dd format
            console.log('Validated Departure Date (yyyy-mm-dd):', departureDate);
    
            const returnDate = document.getElementById('returnDate').value.trim();
            if (tripType === 'round-trip') {
                console.log('Raw Return Date Input (if round-trip):', returnDate);
            }
    
            const adults = document.getElementById('adults').value;
            const children = document.getElementById('children').value;
            const infants = document.getElementById('infants').value;
            console.log('Passengers: Adults:', adults, 'Children:', children, 'Infants:', infants);
    
            const errorMessage = document.getElementById('errorMessage');
    
            // Reset error message
            errorMessage.textContent = '';
    
            // Regular expressions for validation
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Matches yyyy-mm-dd
            const cityRegex = /^[A-Za-z\s]+$/;
            const adultsRegex = /^[1-4]$/;
            const childrenInfantsRegex = /^[0-4]$/;
    
            console.log('Starting validation checks...');
    
            // Validate departure date format
            if (!dateRegex.test(departureDateInput)) {
                errorMessage.textContent = 'Departure date must be in the format yyyy-mm-dd.';
                console.error('Invalid Departure Date Format:', departureDateInput);
                return;
            }
    
            console.log('Departure date format is valid.');
    
            // Validate departure date range
            const departureDateObj = new Date(departureDate);
            console.log('Parsed Departure Date Object:', departureDateObj);
    
            const minDate = new Date('2024-09-01');
            const maxDate = new Date('2024-12-01');
            console.log('Valid Date Range: Min:', minDate, 'Max:', maxDate);
    
            if (departureDateObj >= minDate && departureDateObj <= maxDate) {
                console.log('Departure date is within range.');
            } else {
                console.error('Departure date is out of range:', departureDateObj);
                errorMessage.textContent = 'Departure date must be between September 1, 2024 and December 1, 2024.';
                return;
            }
    
            // If round-trip, validate return date
            if (tripType === 'round-trip') {
                if (!returnDate) {
                    errorMessage.textContent = 'Please enter a return date.';
                    console.error('Return date is missing for round-trip.');
                    return;
                }
    
                if (!dateRegex.test(returnDate)) {
                    errorMessage.textContent = 'Return date must be in the format yyyy-mm-dd.';
                    console.error('Invalid Return Date Format:', returnDate);
                    return;
                }
    
                const returnDateObj = new Date(returnDate);
                console.log('Parsed Return Date Object:', returnDateObj);
    
                if (returnDateObj < departureDateObj) {
                    errorMessage.textContent = 'Return date cannot be before departure date.';
                    console.error('Return date is before departure date:', returnDateObj, departureDateObj);
                    return;
                }
    
                if (returnDateObj < minDate || returnDateObj > maxDate) {
                    errorMessage.textContent = 'Return date must be between September 1, 2024 and December 1, 2024.';
                    console.error('Return date is out of range:', returnDateObj);
                    return;
                }
                console.log('Return date is valid.');
            }
    
            console.log('All validations passed. Proceeding with form submission.');
            // Validate origin and destination format
            if (!cityRegex.test(origin)) {
                errorMessage.textContent = 'Origin must contain only alphabetic characters and spaces.';
                return;
            }

            if (!cityRegex.test(destination)) {
                errorMessage.textContent = 'Destination must contain only alphabetic characters and spaces.';
                return;
            }

            // Validate origin and destination are cities in Texas or California
            const citiesInTexas = ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena', 'McKinney', 'Mesquite', 'Frisco', 'Killeen', 'McAllen', 'Waco', 'Carrollton', 'Denton', 'Midland', 'Abilene', 'Beaumont', 'Round Rock', 'Odessa'];
            const citiesInCalifornia = ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita', 'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario'];
            const allCities = [...citiesInTexas, ...citiesInCalifornia];

            if (!allCities.map(city => city.toLowerCase()).includes(origin.toLowerCase())) {
                errorMessage.textContent = 'Origin must be a city in Texas or California.';
                return;
            }

            if (!allCities.map(city => city.toLowerCase()).includes(destination.toLowerCase())) {
                errorMessage.textContent = 'Destination must be a city in Texas or California.';
                return;
            }

            // Validate number of passengers
            if (!adultsRegex.test(adults)) {
                errorMessage.textContent = 'Number of adults must be between 1 and 4.';
                return;
            }

            if (!childrenInfantsRegex.test(children)) {
                errorMessage.textContent = 'Number of children must be between 0 and 4.';
                return;
            }

            if (!childrenInfantsRegex.test(infants)) {
                errorMessage.textContent = 'Number of infants must be between 0 and 4.';
                return;
            }

            // If all validations pass, display the information
            if (errorMessage.textContent === '') {
                // Display the basic flight search information
                document.getElementById('displayTripType').textContent = tripType === 'one-way' ? 'One Way' : 'Round Trip';
                document.getElementById('displayOrigin').textContent = origin;
                document.getElementById('displayDestination').textContent = destination;
                document.getElementById('displayDepartureDate').textContent = departureDate;
    
                if (tripType === 'round-trip') {
                    document.getElementById('displayReturnDate').textContent = returnDate;
                    document.getElementById('returnDateRow').style.display = 'table-row';
                } else {
                    document.getElementById('returnDateRow').style.display = 'none';
                }
    
                const totalPassengers = `${adults} adults, ${children} children, ${infants} infants`;
                document.getElementById('displayPassengers').textContent = totalPassengers;
    
                // Show the displayInfo div
                document.getElementById('displayInfo').style.display = 'block';
    
                // Only fetch and display available flights for one-way trips
                if (tripType === 'one-way') {
                    const searchCriteria = {
                        tripType,
                        origin,
                        destination,
                        departureDate, // Normalized to yyyy-mm-dd
                        adults,
                        children,
                        infants
                    };
                    
    
                    // Fetch flights data from XML file
// Fetch flights data from XML file
fetch(`available_flights.xml?timestamp=${new Date().getTime()}`)
    .then(response => response.text())
    .then(xmlString => {
        const availableFlights = parseAndFilterFlights(xmlString, searchCriteria);
        displayAvailableFlights(availableFlights, departureDate);
    })
    .catch(error => {
        console.error('Error loading flights:', error);
        errorMessage.textContent = 'Error loading flight information. Please try again.';
    });

                }
    
                // Hide the passenger form if it's open
                if (passengerForm.style.display === 'block') {
                    passengerForm.style.display = 'none';
                }
            }
        });
    }
    // Form handling (if contact form exists)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission for validation

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const email = document.getElementById('email').value.trim();
            const comment = document.getElementById('comment').value.trim();
            const gender = document.querySelector('input[name="gender"]:checked');
            const errorMessage = document.getElementById('errorMessage');

            // Regular expressions
            const nameRegex = /^[A-Z][a-zA-Z]*$/; // Starts with a capital letter, only alphabetic characters
            const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/; // Format: (ddd) ddd-dddd
            const emailRegex = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/; // Contains @ and .
            
            // Clear previous error message
            errorMessage.textContent = '';

            // Validation checks
            if (!nameRegex.test(firstName)) {
                errorMessage.textContent = 'First name must start with a capital letter and contain only alphabetic characters.';
                return;
            }

            if (!nameRegex.test(lastName)) {
                errorMessage.textContent = 'Last name must start with a capital letter and contain only alphabetic characters.';
                return;
            }

            if (firstName === lastName) {
                errorMessage.textContent = 'First name and last name cannot be the same.';
                return;
            }

            if (!phoneRegex.test(phoneNumber)) {
                errorMessage.textContent = 'Phone number must be in the format (123) 456-7890.';
                return;
            }

            if (!emailRegex.test(email)) {
                errorMessage.textContent = 'Please enter a valid email address containing "@" and ".".';
                return;
            }

            if (!gender) {
                errorMessage.textContent = 'Please select your gender.';
                return;
            }

            if (comment.length < 10) {
                errorMessage.textContent = 'Comment must be at least 10 characters long.';
                return;
            }

            // If all validations pass
            if (errorMessage.textContent === '') {
                // Prepare data for AJAX
                const formData = {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    email: email,
                    gender: gender.value,
                    comment: comment
                };

                // AJAX request to submit_contact.php
                fetch('submit_contact.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.text())
                .then(data => {
                    alert(data); // Display server response
                })
                .catch(error => console.error('Error:', error));
            }
        });
    }

    // Apply saved settings when page loads
    applySavedSettings();
});