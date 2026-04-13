<?php
/**
 * Cleanup script to delete messages older than 48 hours.
 * This is included in message-related API endpoints to ensure
 * the database remains limited to recent conversations as requested.
 */

try {
    // Note: $pdo must be defined in the calling script before including this
    if (isset($pdo)) {
        // Delete messages older than 48 hours
        $cleanupStmt = $pdo->prepare("DELETE FROM messages WHERE created_at < (NOW() - INTERVAL 48 HOUR)");
        $cleanupStmt->execute();
    }
} catch (Exception $e) {
    // Log error but don't block the main request
    error_log("Message Cleanup Error: " . $e->getMessage());
}
?>