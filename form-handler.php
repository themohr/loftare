<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://loftare.studio');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

$to      = 'dennis@loftare.studio';
$subject = 'New inquiry from ' . $name;
$body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";
$headers = implode("\r\n", [
    'From: noreply@loftare.studio',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}
