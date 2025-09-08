-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run order confirmation every 5 minutes
SELECT cron.schedule(
  'whatsapp-order-confirm',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://msrajpxxrczejxqvwcxl.supabase.co/functions/v1/send-order-confirm',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcmFqcHh4cmN6ZWp4cXZ3Y3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDQ0MDYsImV4cCI6MjA3MjEyMDQwNn0.y39UaCqUQSkAzKJX3V543ogXlTSNurATt6eui6yrHg4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);