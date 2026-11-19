/**
 * cashier.js - Modul Logika Perhitungan Kasir & Pembayaran Toko Kopi Sembilan
 * Digunakan untuk Pengujian White-Box Unit Testing (Modul 4 PKPL)
 */

function processCashierPayment(total, cashPaid, paymentMethod) {
    // S1: Inisialisasi status transaksi
    let status = "";
    // S2: Inisialisasi nilai kembalian
    let change = 0;

    // S3: Validasi apakah total tagihan sah (> 0)
    if (total > 0) {
        // S4: Periksa apakah metode pembayaran tunai (CASH)
        if (paymentMethod === "CASH") {
            // S5: Periksa apakah uang tunai mencukupi tagihan
            if (cashPaid >= total) {
                // S6: Tetapkan status transaksi lunas
                status = "Lunas";
                // S7: Hitung nilai uang kembalian
                change = cashPaid - total;
            } else {
                // S8: Tetapkan status uang tunai kurang
                status = "Jumlah Bayar Kurang";
            }
        } else if (paymentMethod === "QRIS") {
            // S9: Tetapkan status transaksi lunas via nontunai
            status = "Lunas";
        } else {
            // S10: Tetapkan status metode tidak dikenali
            status = "Metode Tidak Valid";
        }
    } else {
        // S11: Tetapkan status total belanja tidak sah
        status = "Total Tidak Valid";
    }

    // S12: Kembalikan objek status dan kembalian
    return { status, change };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { processCashierPayment };
}
