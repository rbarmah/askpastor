/*
  # Create notification subscriptions table

  1. New Tables
    - `notification_subscriptions`
      - `id` (uuid, primary key)
      - `user_identifier` (text, anonymous user identifier)
      - `endpoint` (text, push subscription endpoint)
      - `p256dh_key` (text, push subscription p256dh key)
      - `auth_key` (text, push subscription auth key)
      - `is_active` (boolean, whether subscription is active)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on notification_subscriptions table
    - Add policies for public read/write access
*/

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notification subscriptions"
  ON notification_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert notification subscriptions"
  ON notification_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update notification subscriptions"
  ON notification_subscriptions
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete notification subscriptions"
  ON notification_subscriptions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user_identifier ON notification_subscriptions(user_identifier);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_active ON notification_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_endpoint ON notification_subscriptions(endpoint);