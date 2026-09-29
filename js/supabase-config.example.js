// ════════════════════════════════════════════════════════════════════
// KONFIGURASI SUPABASE API (TEMPLATE / EXAMPLE)
// Salin file ini menjadi 'supabase-config.js' dan isi kredensial Anda.
// ════════════════════════════════════════════════════════════════════
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Inisialisasi klien Supabase dengan nama variabel 'db' agar tidak bentrok
const db = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Fungsi pembantu untuk memformat Rupiah
function fmtRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

/**
 * Memformat input teks menjadi format ribuan (IDR) secara real-time
 */
function formatPriceInput(el) {
  let val = el.value.replace(/\D/g, "");
  if (val === "") {
    el.value = "";
    return;
  }
  el.value = Number(val).toLocaleString('id-ID');
}

/**
 * Mengubah string berformat (titik) kembali menjadi angka mentah
 */
function parsePrice(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/\D/g, "")) || 0;
}

/**
 * Memformat angka mentah menjadi string ribuan tanpa simbol Rp
 */
function formatIDR(num) {
  return (Number(num) || 0).toLocaleString('id-ID');
}
