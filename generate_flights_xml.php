<?php
// A limited list of commercial cities in Texas and California
$texasCities = ['Austin', 'Dallas', 'Houston', 'San Antonio'];
$californiaCities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'];

// Create XML structure
$xml = new SimpleXMLElement('<Flights/>');

// Generate 50 random flights
for ($i = 1; $i <= 50; $i++) {
    $flight = $xml->addChild('Flight');
    $flight->addChild('FlightID', 'TXCA' . str_pad($i, 3, '0', STR_PAD_LEFT));

    // Randomly select origin and destination
    $origin = $texasCities[array_rand($texasCities)];
    $destination = $californiaCities[array_rand($californiaCities)];

    $flight->addChild('Origin', $origin);
    $flight->addChild('Destination', $destination);

    // Generate random dates between Sep 1, 2024, and Dec 1, 2024
    $departureDate = date("Y-m-d", mt_rand(strtotime("2024-09-01"), strtotime("2024-12-01")));
    $arrivalDate = $departureDate; // Assuming same-day flights

    $flight->addChild('DepartureDate', $departureDate);
    $flight->addChild('ArrivalDate', $arrivalDate);

    // Generate random times
    $departureTime = sprintf('%02d:%02d', rand(5, 21), rand(0, 59)); // Flights between 5 AM and 9 PM
    $arrivalTime = sprintf('%02d:%02d', rand(5, 21), rand(0, 59));

    $flight->addChild('DepartureTime', $departureTime);
    $flight->addChild('ArrivalTime', $arrivalTime);

    // Random available seats and price
    $flight->addChild('AvailableSeats', rand(1, 150)); // Up to 150 seats
    $flight->addChild('Price', rand(150, 600)); // Prices between $150 and $600
}

// Save XML to a file
$xml->asXML('available_flights.xml');
echo "XML file 'available_flights.xml' created successfully!";
?>
