-- Rollback Migration 006: Restore ai_provider table
-- Author: Claude Code
-- Date: 2025-01-19
-- PRP: 006-replace-ai-provider-table-with-json-config

-- WARNING: This rollback script restores the table structure but data must be reseeded
-- Provider data should be restored from supported-providers.json or backup

-- =============================
-- STEP 1: Recreate ai_provider table
-- =============================

CREATE TABLE ai_provider (
  providerId varchar(21) PRIMARY KEY,
  name varchar(100) NOT NULL,
  baseUrl text,
  KEY ai_provider_name_idx (name)
);

-- =============================
-- STEP 2: Reseed provider data from JSON configuration
-- =============================

-- Insert standard providers (update these values based on supported-providers.json)
INSERT INTO ai_provider (providerId, name, baseUrl) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1'),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1'),
('google', 'Google', 'https://generativelanguage.googleapis.com'),
('xai', 'XAI', 'https://api.x.ai/v1');

-- =============================
-- STEP 3: Restore foreign key constraints
-- =============================

-- Add foreign key constraint on ai_model.providerId
ALTER TABLE ai_model 
ADD CONSTRAINT ai_model_provider_id_fk 
FOREIGN KEY (providerId) REFERENCES ai_provider(providerId);

-- Add foreign key constraint on ai_team_provider_token.providerId  
ALTER TABLE ai_team_provider_token 
ADD CONSTRAINT ai_team_provider_token_provider_id_fk 
FOREIGN KEY (providerId) REFERENCES ai_provider(providerId);

-- =============================
-- STEP 4: Verification
-- =============================

-- Verify table was created
SHOW TABLES LIKE 'ai_provider';

-- Verify foreign keys were restored
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'ai_provider';

-- Verify data integrity
SELECT COUNT(*) as total_providers FROM ai_provider;
SELECT COUNT(*) as total_models FROM ai_model;
SELECT COUNT(*) as total_tokens FROM ai_team_provider_token;