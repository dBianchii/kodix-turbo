-- ============================================
-- SQL para verificar status da migração AI Studio
-- ============================================

-- 1. Verificar quais tabelas AI existem no banco
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('ai_team_provider_token', 'ai_team_model_config') THEN '✅ Nova estrutura'
        WHEN table_name IN ('ai_provider_token', 'ai_team_provider_config') THEN '❌ Estrutura antiga'
        ELSE '📋 Estrutura base'
    END as status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name LIKE 'ai_%'
ORDER BY table_name;

-- ============================================

-- 2. Verificar se tabelas antigas ainda existem
SELECT 
    COUNT(*) as tabelas_antigas_restantes
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('ai_provider_token', 'ai_team_provider_config');

-- ============================================

-- 3. Verificar se novas tabelas foram criadas
SELECT 
    COUNT(*) as novas_tabelas_criadas
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('ai_team_provider_token', 'ai_team_model_config');

-- ============================================

-- 4. Contar registros nas tabelas (se existirem)

-- Tokens de provider (nova estrutura)
SELECT 'ai_team_provider_token' as tabela, COUNT(*) as registros
FROM ai_team_provider_token
UNION ALL
-- Configurações de modelo (nova estrutura)  
SELECT 'ai_team_model_config' as tabela, COUNT(*) as registros
FROM ai_team_model_config
UNION ALL
-- Providers (base)
SELECT 'ai_provider' as tabela, COUNT(*) as registros
FROM ai_provider
UNION ALL
-- Modelos (base)
SELECT 'ai_model' as tabela, COUNT(*) as registros
FROM ai_model;

-- ============================================

-- 5. Verificar relacionamentos das novas tabelas
SELECT 
    t.team_name,
    p.name as provider_name,
    COUNT(token.id) as tokens_configurados
FROM teams t
LEFT JOIN ai_team_provider_token token ON t.id = token.teamId
LEFT JOIN ai_provider p ON token.providerId = p.id
GROUP BY t.id, t.team_name, p.name
ORDER BY t.team_name, p.name;

-- ============================================

-- 6. Verificar modelos disponíveis por team
SELECT 
    t.team_name,
    m.name as model_name,
    p.name as provider_name,
    config.enabled,
    config.priority
FROM teams t
LEFT JOIN ai_team_model_config config ON t.id = config.teamId
LEFT JOIN ai_model m ON config.modelId = m.id
LEFT JOIN ai_provider p ON m.providerId = p.id
ORDER BY t.team_name, config.priority, m.name;

-- ============================================

-- 7. Diagnóstico completo
SELECT 
    'MIGRAÇÃO STATUS' as categoria,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name IN ('ai_provider_token', 'ai_team_provider_config')
        ) = 0 
        AND (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name IN ('ai_team_provider_token', 'ai_team_model_config')
        ) = 2
        THEN '✅ MIGRAÇÃO CONCLUÍDA'
        ELSE '⚠️ MIGRAÇÃO PENDENTE'
    END as status; 