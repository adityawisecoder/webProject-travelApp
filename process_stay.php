<?php
// process_stay.php

// Enable error reporting for debugging (can be removed in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get user inputs from the POST request
$city = isset($_POST['city']) ? trim($_POST['city']) : '';
$checkInDate = isset($_POST['checkInDate']) ? $_POST['checkInDate'] : '';
$checkOutDate = isset($_POST['checkOutDate']) ? $_POST['checkOutDate'] : '';
$adults = isset($_POST['adults']) ? intval($_POST['adults']) : 0;
$children = isset($_POST['children']) ? intval($_POST['children']) : 0;
$infants = isset($_POST['infants']) ? intval($_POST['infants']) : 0;

// Define valid cities and date range
$validCities = [
    // Texas cities
    'Houston',
    'San Antonio',
    'Dallas',
    'Austin',
    'Fort Worth',
    'El Paso',
    // California cities
    'Los Angeles',
    'San Diego',
    'San Francisco',
    'Sacramento',
    'Fresno',
    'Oakland',
];
$minDate = '2024-09-01';
$maxDate = '2024-12-01';

// Validate city input
if (!in_array($city, $validCities)) {
    echo '<p>Error: City must be in Texas or California.</p>';
    exit();
}

// Validate date input
if (
    $checkInDate < $minDate ||
    $checkOutDate > $maxDate ||
    $checkInDate >= $checkOutDate
) {
    echo '<p>Error: Check-in and check-out dates must be between Sep 1, 2024, and Dec 1, 2024. Check-out date must be after check-in date.</p>';
    exit();
}

// Validate guests input
$totalGuests = $adults + $children;
if ($totalGuests > 2 && $infants === 0) {
    echo '<p>Error: A room can have at most 2 guests excluding infants.</p>';
    exit();
}

// Calculate the number of rooms needed
$roomsNeeded = ceil($totalGuests / 2);

// Load hotel data from the JSON file
$hotelsData = file_get_contents('hotels.json');
if ($hotelsData === false) {
    echo '<p>Error: Could not load hotel data.</p>';
    exit();
}

$hotels = json_decode($hotelsData, true);
if ($hotels === null) {
    echo '<p>Error: Invalid JSON format in hotels.json file.</p>';
    exit();
}

// Filter hotels based on the city
$availableHotels = array_filter($hotels, function ($hotel) use ($city) {
    return strtolower($hotel['city']) === strtolower($city);
});

// Display the results
if (empty($availableHotels)) {
    echo '<p>No available hotels found for the selected city.</p>';
} else {
    echo "<h3>Available Hotels in $city</h3>";
    echo "<table border='1'>
            <tr>
                <th>Hotel ID</th>
                <th>Hotel Name</th>
                <th>City</th>
                <th>Available Rooms</th>
                <th>Price per Night</th>
                <th>Action</th>
            </tr>";

    foreach ($availableHotels as $hotel) {
        // Check if the hotel has enough available rooms
        if ($hotel['available-rooms'] >= $roomsNeeded) {
            echo "<tr>
                    <td>{$hotel['hotel-id']}</td>
                    <td>{$hotel['hotel-name']}</td>
                    <td>{$hotel['city']}</td>
                    <td>{$hotel['available-rooms']}</td>
                    <td>\${$hotel['price-per-night']}</td>
                    <td>
                        <form action='add_to_cart.php' method='POST'>
                            <input type='hidden' name='hotelId' value='{$hotel['hotel-id']}'>
                            <input type='hidden' name='hotelName' value='{$hotel['hotel-name']}'>
                            <input type='hidden' name='city' value='{$hotel['city']}'>
                            <input type='hidden' name='checkInDate' value='$checkInDate'>
                            <input type='hidden' name='checkOutDate' value='$checkOutDate'>
                            <input type='hidden' name='adults' value='$adults'>
                            <input type='hidden' name='children' value='$children'>
                            <input type='hidden' name='infants' value='$infants'>
                            <input type='hidden' name='pricePerNight' value='{$hotel['price-per-night']}'>
                            <button type='submit'>Add to Cart</button>
                        </form>
                    </td>
                  </tr>";
        }
    }

    echo '</table>';
}
?>
