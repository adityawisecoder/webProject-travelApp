<?php
// Get the raw POST data from AJAX
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    // Define XML structure
    $xml = new SimpleXMLElement('<ContactForm/>');
    $xml->addChild('FirstName', htmlspecialchars($data['firstName']));
    $xml->addChild('LastName', htmlspecialchars($data['lastName']));
    $xml->addChild('PhoneNumber', htmlspecialchars($data['phoneNumber']));
    $xml->addChild('Email', htmlspecialchars($data['email']));
    $xml->addChild('Gender', htmlspecialchars($data['gender']));
    $xml->addChild('Comment', htmlspecialchars($data['comment']));

    // Save XML to a file in the project directory
    $xml->asXML('contact_form_data.xml');

    // Send a success response back to the AJAX call
    echo "Data saved to XML successfully!";
} else {
    // Send an error response if data is missing
    echo "No data received.";
}
?>
