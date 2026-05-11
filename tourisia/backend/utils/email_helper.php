<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

/**
 * Utility function to send a welcome email to a new user using PHPMailer.
 * 
 * @param string $email The recipient's email address.
 * @param string $fullname The recipient's full name.
 * @return bool True if the email was sent successfully, false otherwise.
 */
function sendWelcomeEmail($email, $fullname)
{
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'sandbox.smtp.mailtrap.io';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: '';
        $mail->Password   = getenv('SMTP_PASS') ?: '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)(getenv('SMTP_PORT') ?: 587);

        // Destinataires
        $mail->setFrom('no-reply@tourisia.com', 'Tourisia');
        $mail->addAddress($email, $fullname);

        // Contenu
        $mail->isHTML(true);
        $mail->Subject = "Bienvenue chez Tourisia ! 🌍";

        $mail->Body = "
        <html>
        <head>
            <style>
                .container { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
                .header { text-align: center; padding-bottom: 20px; }
                .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
                .content { padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
                .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #888; }
                .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='logo'>Tourisia</div>
                </div>
                <div class='content'>
                    <h2>Bonjour $fullname !</h2>
                    <p>Bienvenue au sein de la communauté Tourisia. Nous sommes ravis de vous compter parmi nos nouveaux voyageurs.</p>
                    <p>Votre compte a été créé avec succès. Vous pouvez désormais explorer nos destinations, réserver vos prochaines aventures et partager vos expériences.</p>
                    <a href='http://localhost:3000' class='button'>Commencer l'exploration</a>
                    <p style='margin-top: 30px;'>À très bientôt,<br>L'équipe Tourisia</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2026 Tourisia. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
