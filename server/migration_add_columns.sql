-- Migration: Add missing columns to Requests table
-- Run this in your PostgreSQL database

-- Add completed_at timestamp
ALTER TABLE "Requests" 
ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP WITH TIME ZONE;

-- Add acknowledgment fields
ALTER TABLE "Requests" 
ADD COLUMN IF NOT EXISTS "acknowledged_by_requester" BOOLEAN DEFAULT FALSE;

ALTER TABLE "Requests" 
ADD COLUMN IF NOT EXISTS "acknowledged_at" TIMESTAMP WITH TIME ZONE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Requests' 
ORDER BY ordinal_position;

