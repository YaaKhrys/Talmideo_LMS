<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'talmiddeo@gmail.com';
    $mail->Password   = 'JisherE24/7@';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('talmiddeo@gmail.com', 'Talmidēo');
    $mail->addAddress('talmiddeo@gmail.com');

    $mail->isHTML(true);
    $mail->Subject = 'Test Email';
    $mail->Body    = '<b>PHPMailer is working!</b>';

    $mail->send();
    echo "Email sent successfully!";
} catch (Exception $e) {
    echo "Mailer Error: {$mail->ErrorInfo}";
}