/**
 * cashier.js - Modul Logika Inti 8 Fitur In-Scope Cashier System UMKM Toko Kopi Sembilan
 * Digunakan untuk Pengujian White-Box & Unit Testing (Modul 4 PKPL)
 */

// ══════════════════════════════════════════════════════════════════════════
// FITUR 1: LOGIN (RQ-001)
// ══════════════════════════════════════════════════════════════════════════
function validateLogin(username, password, registeredUser) {
    if (!username || !password) {
        return { success: false, message: "Username dan password wajib diisi" };
    }
    if (!registeredUser || registeredUser.username !== username || registeredUser.password !== password) {
        return { success: false, message: "Username atau password salah" };
    }
    return { success: true, message: "Login berhasil", role: registeredUser.role };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 2: REGISTER (RQ-002)
// ══════════════════════════════════════════════════════════════════════════
function validateRegister(fullName, username, password, confirmPassword, existingUsernames) {
    if (!fullName || !username || !password || !confirmPassword) {
        return { success: false, message: "Semua kolom wajib diisi" };
    }
    if (password.length < 6) {
        return { success: false, message: "Password minimal 6 karakter" };
    }
    if (password !== confirmPassword) {
        return { success: false, message: "Konfirmasi password tidak cocok" };
    }
    if (existingUsernames.includes(username)) {
        return { success: false, message: "Username sudah terdaftar" };
    }
    return { success: true, message: "Registrasi berhasil" };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 3: FORGOT PASSWORD (RQ-003)
// ══════════════════════════════════════════════════════════════════════════
function validateResetPassword(username, newPassword, confirmPassword, existingUsernames) {
    if (!username || !newPassword || !confirmPassword) {
        return { success: false, message: "Data pemulihan wajib diisi lengkap" };
    }
    if (!existingUsernames.includes(username)) {
        return { success: false, message: "Username tidak ditemukan" };
    }
    if (newPassword.length < 6) {
        return { success: false, message: "Password baru minimal 6 karakter" };
    }
    if (newPassword !== confirmPassword) {
        return { success: false, message: "Konfirmasi password baru tidak cocok" };
    }
    return { success: true, message: "Password berhasil diperbarui" };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 4: DASHBOARD (RQ-004)
// ══════════════════════════════════════════════════════════════════════════
function calculateDashboardMetrics(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return { totalRevenue: 0, totalOrders: 0, averageOrder: 0, cashCount: 0, qrisCount: 0 };
    }
    let totalRevenue = 0;
    let cashCount = 0;
    let qrisCount = 0;
    for (const trx of transactions) {
        totalRevenue += trx.total;
        if (trx.method === "CASH") {
            cashCount += 1;
        } else {
            qrisCount += 1;
        }
    }
    const totalOrders = transactions.length;
    const averageOrder = Math.round(totalRevenue / totalOrders);
    return { totalRevenue, totalOrders, averageOrder, cashCount, qrisCount };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 5: INVENTARIS PRODUK (RQ-005)
// ══════════════════════════════════════════════════════════════════════════
function validateProductInput(name, category, price) {
    if (!name || !category) {
        return { valid: false, message: "Nama produk dan kategori wajib diisi" };
    }
    if (typeof price !== "number" || price < 1000 || price > 500000) {
        return { valid: false, message: "Harga produk harus antara Rp 1.000 - Rp 500.000" };
    }
    return { valid: true, message: "Produk berhasil disimpan" };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 6: MANAJEMEN PESANAN / KASIR POS (RQ-006 - Pre-Lab White-Box Basis)
// ══════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════
// FITUR 7: LAPORAN KEUANGAN (RQ-007)
// ══════════════════════════════════════════════════════════════════════════
function filterFinancialReport(transactions, startDate, endDate) {
    if (!startDate || !endDate || startDate > endDate) {
        return { valid: false, message: "Rentang tanggal laporan tidak valid", count: 0, totalAmount: 0 };
    }
    const filtered = transactions.filter((t) => t.date >= startDate && t.date <= endDate);
    const totalAmount = filtered.reduce((sum, t) => sum + t.total, 0);
    return { valid: true, message: "Laporan berhasil difilter", count: filtered.length, totalAmount };
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 8: MANAJEMEN PENGGUNA / RBAC (RQ-008)
// ══════════════════════════════════════════════════════════════════════════
function validateUserManagement(actorRole, username, targetRole) {
    if (actorRole !== "admin") {
        return { allowed: false, message: "Akses ditolak: Hanya Admin yang dapat mengelola pengguna" };
    }
    if (!username || !["admin", "kasir"].includes(targetRole)) {
        return { allowed: false, message: "Username dan peran (admin/kasir) tidak valid" };
    }
    return { allowed: true, message: "Akun pengguna berhasil disimpan" };
}

module.exports = {
    validateLogin,
    validateRegister,
    validateResetPassword,
    calculateDashboardMetrics,
    validateProductInput,
    processCashierPayment,
    filterFinancialReport,
    validateUserManagement
};
