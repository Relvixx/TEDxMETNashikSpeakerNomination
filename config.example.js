window.CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON: 'YOUR_SUPABASE_ANON_KEY',
  EMAILJS_PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
  EMAILJS_SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
  EMAILJS_TEMPLATE_ADMIN: 'YOUR_EMAILJS_TEMPLATE_ADMIN',
  EMAILJS_TEMPLATE_USER: 'YOUR_EMAILJS_TEMPLATE_USER',

  // ——————————————————————————————————————————
  // ADMIN DASHBOARD — Password Hash
  // ——————————————————————————————————————————
  // To generate a SHA-256 hash, run this one-liner in your browser console:
  //
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
  //     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  //
  // Replace 'YOUR_PASSWORD' with your chosen admin password.
  // Copy the resulting hex string and paste it below.
  // ——————————————————————————————————————————
  ADMIN_PASSWORD_HASH: 'YOUR_SHA256_HASH_HERE'
};
