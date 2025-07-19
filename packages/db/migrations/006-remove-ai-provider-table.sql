-- Migration 006: Remove ai_provider table and replace with JSON configuration
-- Author: Claude Code
-- Date: 2025-01-19
-- PRP: 006-replace-ai-provider-table-with-json-config

-- =============================
-- STEP 1: Verify data integrity
-- =============================

-- Check for orphaned model references (should be 0)
SELECT COUNT(*) as orphaned_models 
FROM ai_model 
WHERE providerId NOT IN (
  SELECT providerId FROM ai_provider
);

-- Check for orphaned token references (should be 0)
SELECT COUNT(*) as orphaned_tokens
FROM ai_team_provider_token 
WHERE providerId NOT IN (
  SELECT providerId FROM ai_provider
);

-- =============================
-- STEP 2: Remove foreign key constraints
-- =============================

-- Drop foreign key constraint on ai_model.providerId
ALTER TABLE ai_model 
DROP FOREIGN KEY ai_model_provider_id_fk;

-- Drop foreign key constraint on ai_team_provider_token.providerId  
ALTER TABLE ai_team_provider_token 
DROP FOREIGN KEY ai_team_provider_token_provider_id_fk;

-- =============================
-- STEP 3: Drop the ai_provider table
-- =============================

DROP TABLE ai_provider;

-- =============================
-- STEP 4: Verification
-- =============================

-- Verify table was dropped
SHOW TABLES LIKE 'ai_provider';

-- Verify ai_model table still exists and has providerId column
DESCRIBE ai_model;

-- Verify ai_team_provider_token table still exists and has providerId column
DESCRIBE ai_team_provider_token;

-- Show remaining models with their provider IDs
SELECT modelId, providerId, enabled, status 
FROM ai_model 
LIMIT 10;

-- Show remaining tokens with their provider IDs
SELECT id, teamId, providerId, createdAt 
FROM ai_team_provider_token 
LIMIT 10;