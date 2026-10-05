window.CONFIG = {
  SUPABASE_URL: 'https://mrgtyqhhjublabafzwpn.supabase.co',
  SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZ3R5cWhoanVibGFiYWZ6d3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTcxMDIsImV4cCI6MjEwNjc5MzEwMn0.-RRjYGMHE-Nt-_u-_qUUvgvqjpYKe7PNxUQChLfIi7o',
  EMAILJS_PUBLIC_KEY: 'ONjViRAkMpCeXS4_U',
  EMAILJS_SERVICE_ID: 'service_xb39y8x',
  EMAILJS_TEMPLATE_ADMIN: 'template_5sovydg',
  EMAILJS_TEMPLATE_USER: 'template_om2uizy',

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
  ADMIN_PASSWORD_HASH: 'edd07c8ad519d78df80a18ffbdcd3a2f1629dc214f80736e5f9f41e7003054a8'
};
