# Cron Job: Cleanup Expired Pending Users

## Purpose

Automatically deletes expired `pending_users` records from the database to keep your system clean and prevent "ghost" accounts.

## Why

- Users who never verify their email are removed after a set time (`token_expires_at`).
- Reduces database clutter.
- Improves registration system reliability.

## How It Works

- The cron job triggers a PHP script at scheduled intervals.
- The script executes a query to delete expired accounts:
- Optional logging can record each run to a file for reference.
- Only affects the subdomain database; safe for other systems.
- Testing: Enter in browser https://christabellowusu.eagletechafrica.com/other/cron/cleanup_pending_users.php

## Modifying the Cron Job

- Update the PHP script path if moved.
- Adjust the schedule (minutes, hours, etc.) in the cron job settings.
- Modify cleanup logic in the script if needed.

## Terminating / Deleting the Cron Job

- Locate your cron job in your hosting control panel.
- Delete or disable it.
- Optionally, delete the cleanup script from the server.

## Notes

- Only affects the subdomain database (`pending_users` table).
- Safe: does not impact other users or the school’s main systems.
- Logging is optional but recommended for monitoring.
