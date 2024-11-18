<?php
// add_to_cart.php

// Start the session to store cart details
session_start();

// Enable error reporting for debugging (can be removed in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Retrieve hotel and booking details from POST request
$hotelId = isset($_POST['hotelId']) ? $_POST['hotelId'] : '';
$hotelName = isset($_POST['hotelName']) ? $_POST['hotelName'] : '';
$city = isset($_POST['city']) ? $_POST['city'] : '';
$checkInDate = isset($_POST['checkInDate']) ? $_POST['checkInDate'] : '';
$checkOutDate = isset($_POST['checkOutDate']) ? $_POST['checkOutDate'] : '';
$adults = isset($_POST['adults']) ? intval($_POST['adults']) : 0;
$children = isset($_POST['children']) ? intval($_POST['children']) : 0;
$infants = isset($_POST['infants']) ? intval($_POST['infants']) : 0;
$pricePerNight = isset($_POST['pricePerNight']) ? floatval($_POST['pricePerNight']) : 0;

// Calculate the total number of nights and total price
$totalNights = (strtotime($checkOutDate) - strtotime($checkInDate)) / (60 * 60 * 24);
$totalPrice = $totalNights * $pricePerNight;

// Check if the cart session already exists
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Create a new cart item with the hotel details
$cartItem = [
    'hotelId' => $hotelId,
    'hotelName' => $hotelName,
    'city' => $city,
    'checkInDate' => $checkInDate,
    'checkOutDate' => $checkOutDate,
    'adults' => $adults,
    'children' => $children,
    'infants' => $infants,
    'pricePerNight' => $pricePerNight,
    'totalNights' => $totalNights,
    'totalPrice' => $totalPrice
];

// Add the new item to the cart session
$_SESSION['cart'][] = $cartItem;

// Redirect the user to the cart page with a success message
header("Location: cart.php?message=Hotel added to cart successfully");
exit;
?>
