import { config } from 'dotenv';
import { createConnection } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

async function checkAiModels() {
  // Parse MYSQL_URL
  const mysqlUrl = process.env.MYSQL_URL || 'mysql://root:password@localhost:3306/kodix';
  const url = new URL(mysqlUrl);
  
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading /
  });

  try {
    // Query for gpt-4o model
    const [gpt4oRows] = await connection.execute(
      'SELECT * FROM ai_model WHERE universal_model_id = ? LIMIT 1',
      ['gpt-4o']
    );

    if (gpt4oRows.length > 0) {
      const model = gpt4oRows[0];
      console.log("=== GPT-4o Model Data ===");
      console.log("ID:", model.id);
      console.log("Display Name:", model.config?.displayName || 'N/A');
      console.log("Universal Model ID:", model.universal_model_id);
      console.log("Status:", model.status);
      console.log("Enabled:", model.enabled);
      console.log("\n=== Config Field Contents ===");
      if (model.config) {
        const config = typeof model.config === 'string' ? JSON.parse(model.config) : model.config;
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log("No config found");
      }
      console.log("\n=== Original Config Field ===");
      if (model.original_config) {
        console.log("Has originalConfig:", model.original_config.substring(0, 200) + "...");
      } else {
        console.log("No originalConfig found");
      }
    } else {
      console.log("GPT-4o model not found in database");
    }

    // Check all OpenAI models
    console.log("\n=== All OpenAI Models ===");
    const [allModels] = await connection.execute(
      `SELECT universal_model_id, 
       JSON_EXTRACT(config, '$.displayName') as display_name,
       JSON_KEYS(config) as config_keys,
       JSON_EXTRACT(config, '$.modelFamily') as model_family,
       JSON_EXTRACT(config, '$.modalities') as modalities,
       JSON_EXTRACT(config, '$.toolsSupported') as tools_supported
       FROM ai_model 
       WHERE universal_model_id LIKE '%gpt%' OR universal_model_id LIKE '%o1%'`
    );

    console.log(`Found ${allModels.length} OpenAI models`);
    allModels.forEach(model => {
      console.log(`\n- ${model.universal_model_id}: ${model.display_name}`);
      console.log(`  Config keys: ${model.config_keys}`);
      console.log(`  Model family: ${model.model_family}`);
      console.log(`  Modalities: ${model.modalities}`);
      console.log(`  Tools supported: ${model.tools_supported}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkAiModels();