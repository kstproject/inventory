const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, ''); // Simple cleanup
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initStorage() {
    console.log('Initializing Storage...');

    // Create 'contracts' bucket
    const { data, error } = await supabase.storage.createBucket('contracts', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg']
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket "contracts" already exists.');
        } else {
            console.error('Error creating bucket:', error);
        }
    } else {
        console.log('Bucket "contracts" created successfully.');
    }

    // List buckets to confirm
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets.map(b => b.name));
}

initStorage();
