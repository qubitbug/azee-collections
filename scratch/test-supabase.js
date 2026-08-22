const { createClient } = require('@supabase/supabase-js');

const url = 'https://pxwqnvqkzzupfwjhdnqw.supabase.co';
const key = 'sb_publishable_5kWH1nU5rwPav8crAAp08g_t_jjaKRP';

const supabase = createClient(url, key);

async function testInsertClean() {
  console.log('Testing clean Supabase insert...');
  const { data, error } = await supabase.from('products').insert([{
    name: 'Live Database Bracelet',
    slug: 'live-database-bracelet-' + Date.now(),
    description: 'Testing live cloud database sync across browsers',
    short_description: 'Test sync',
    price: 1500,
    compare_price: 2000,
    images: ['/products/beaded_bracelet.png'],
    materials: 'Freshwater pearls & gold accents',
    stock: 15
  }]).select();

  console.log('Inserted Data:', data);
  console.log('Insert Error:', error);
}

testInsertClean();
