<?php
// cart.php

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if there are items in the cart
$cart = isset($_SESSION['cart']) ? $_SESSION['cart'] : [];
$message = isset($_GET['message']) ? $_GET['message'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['book'])) {
    // Call the function to store booking and update hotel availability
    storeBookingAndUpdateRooms($cart);
}

// Function to store booking in XML file and update available rooms
function storeBookingAndUpdateRooms($cart)
{
    // Load hotel data from the JSON file
    $hotelsData = file_get_contents('hotels.json');
    if ($hotelsData === false) {
        echo '<p>Error: Could not load hotel data.</p>';
        return;
    }

    $hotels = json_decode($hotelsData, true);
    if ($hotels === null) {
        echo '<p>Error: Invalid JSON format in hotels.json file.</p>';
        return;
    }

    // Create a new XML document for bookings
    $xmlFile = 'bookings.xml';
    if (file_exists($xmlFile)) {
        $xml = simplexml_load_file($xmlFile);
    } else {
        $xml = new SimpleXMLElement('<bookings></bookings>');
    }

    // Loop through cart items and store booking details
    foreach ($cart as $item) {
        $booking = $xml->addChild('booking');
        $booking->addChild('hotelId', $item['hotelId']);
        $booking->addChild('hotelName', $item['hotelName']);
        $booking->addChild('city', $item['city']);
        $booking->addChild('checkInDate', $item['checkInDate']);
        $booking->addChild('checkOutDate', $item['checkOutDate']);
        $booking->addChild('adults', $item['adults']);
        $booking->addChild('children', $item['children']);
        $booking->addChild('infants', $item['infants']);
        $booking->addChild(
            'roomsNeeded',
            ceil(($item['adults'] + $item['children']) / 2)
        );
        $booking->addChild('pricePerNight', $item['pricePerNight']);
        $booking->addChild('totalPrice', $item['totalPrice']);

        // Update the available rooms in the hotels.json file
        foreach ($hotels as &$hotel) {
            if ($hotel['hotel-id'] === $item['hotelId']) {
                $roomsNeeded = ceil(($item['adults'] + $item['children']) / 2);
                if ($hotel['available-rooms'] >= $roomsNeeded) {
                    $hotel['available-rooms'] -= $roomsNeeded;
                } else {
                    echo "<p>Error: Not enough rooms available for hotel {$item['hotelName']}.</p>";
                    return;
                }
            }
        }
    }

    // Save the updated XML document
    $xml->asXML($xmlFile);

    // Save the updated hotel data back to the JSON file
    file_put_contents('hotels.json', json_encode($hotels, JSON_PRETTY_PRINT));

    // Clear the cart session after booking
    unset($_SESSION['cart']);

    // Redirect with a success message
    // header(
    //     'Location: cart.php?message=Booking successful! All information saved.'
    // );
    header('Location: confirmStaysCart.html');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Cart</title>
    <link rel="stylesheet" href="mystyle.css">
</head>
<body>
<div class="header">
        <h1>Travel Deals</h1>
        <p id="date-time"></p>
    </div>
    <div class="nav">
        <a href="index.html">Home</a>
        <a href="stays.html">Stays</a>
        <a href="flights.html">Flights</a>
        <a href="cars.html">Cars</a>
        <a href="cruises.html">Cruises</a>
        <a href="contact-us.html">Contact Us</a>
        <a href="cart.html">Cart</a>

    </div>
    <div class="container">
        <div class="sidebar">
            <h2>Categories</h2>
            <ul>
                <li><a href="stays.html">Stays</a></li>
                <li><a href="flights.html">Flights</a></li>
                <li><a href="cars.html">Cars</a></li>
                <li><a href="cruises.html">Cruises</a></li>
            </ul>
        </div>
        <div class="main-content">
            <h2>Welcome to Travel Deals</h2>
            <p>Find the best deals on stays, flights, rental cars, and cruises. Plan your next trip with us!</p>
        </div>
    </div>
    <h1>Your Cart</h1>
    <?php if ($message): ?>
        <p style="color: green;"><?php echo htmlspecialchars($message); ?></p>
    <?php endif; ?>

    <?php if (empty($cart)): ?>
        <p>Your cart is empty.</p>
    <?php else: ?>
        <table border="1">
            <tr>
                <th>Hotel ID</th>
                <th>Hotel Name</th>
                <th>City</th>
                <th>Check-in Date</th>
                <th>Check-out Date</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Infants</th>
                <th>Rooms Needed</th>
                <th>Price per Night</th>
                <th>Total Price</th>
            </tr>
            <?php foreach ($cart as $item): ?>
                <tr>
                    <td><?php echo htmlspecialchars($item['hotelId']); ?></td>
                    <td><?php echo htmlspecialchars($item['hotelName']); ?></td>
                    <td><?php echo htmlspecialchars($item['city']); ?></td>
                    <td><?php echo htmlspecialchars(
                        $item['checkInDate']
                    ); ?></td>
                    <td><?php echo htmlspecialchars(
                        $item['checkOutDate']
                    ); ?></td>
                    <td><?php echo htmlspecialchars($item['adults']); ?></td>
                    <td><?php echo htmlspecialchars($item['children']); ?></td>
                    <td><?php echo htmlspecialchars($item['infants']); ?></td>
                    <td><?php echo ceil(
                        ($item['adults'] + $item['children']) / 2
                    ); ?></td>
                    <td>$<?php echo number_format(
                        $item['pricePerNight'],
                        2
                    ); ?></td>
                    <td>$<?php echo number_format(
                        $item['totalPrice'],
                        2
                    ); ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
        <form method="POST">
            <button type="submit" name="book">Book</button>
        </form>
    <?php endif; ?>
</body>
</html>
