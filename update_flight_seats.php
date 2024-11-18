<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read the incoming JSON payload
    $data = json_decode(file_get_contents('php://input'), true);

    // Get flight ID and passengers booked
    $flightId = $data['flightId'];
    $seatsToReduce = intval($data['seatsBooked']);

    // Load the XML file
    $xmlFile = 'available_flights.xml';
    $xml = simplexml_load_file($xmlFile);

    // Find the flight and update available seats
    foreach ($xml->Flight as $flight) {
        if ((string)$flight->FlightID === $flightId) {
            $availableSeats = intval($flight->AvailableSeats);
            $flight->AvailableSeats = $availableSeats - $seatsToReduce;
            break;
        }
    }

    // Save the updated XML back to the file
    $xml->asXML($xmlFile);

    // Respond with success
    echo json_encode(['status' => 'success']);
} else {
    // Respond with error for invalid requests
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
