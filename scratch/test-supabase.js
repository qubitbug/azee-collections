const { createClient } = require('@supabase/supabase-js');

const url = 'https://pxwqnvqkzzupfwjhdnqw.supabase.co';
const key = 'sb_publishable_5kWH1nU5rwPav8crAAp08g_t_jjaKRP';

const supabase = createClient(url, key);

async function verifyLiveSync() {
  console.log('Verifying live Supabase sync after RLS update...');
  const { data, error } = await supabase.from('products').insert([{
    name: 'Verification Test Bracelet',
    slug: 'verification-test-bracelet-' + Date.now(),
    description: 'Testing live cloud database sync across all browsers',
    short_description: 'Verified live sync',
    price: 1999,
    compare_price: 2500,
    images: ['/products/beaded_bracelet.png'],
    materials: 'Freshwater pearls & 18K Gold',
    stock: 25
  }]).select();

  console.log('Inserted Data:', data ? data[0]?.name : null);
  console.log('Insert Error:', error);
}

verifyLiveSync();
