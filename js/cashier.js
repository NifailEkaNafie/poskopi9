/**
 * js/cashier.js - Modul Layanan 8 Fitur In-Scope Cashier System UMKM Toko Kopi Sembilan
 * Dilengkapi Anotasi Statement (S1..Sn), Decision (D1..Dn), dan Dependency Injection
 */

// ══════════════════════════════════════════════════════════════════════════
// FITUR 1 (RQ-001 / FS-001): AUTENTIKASI MASUK PENGGUNA (LOGIN)
// ══════════════════════════════════════════════════════════════════════════
async function loginUser(username, password, { dbClient, storage, onSuccess }) {
    if (!username || !password) { // S1 (D1)
        return { ok: false, errorMsg: 'Username dan password wajib diisi!' }; // S2
    }
    try {
        const { data, error } = await dbClient.findUser(username, password); // S3
        if (error) { // S4 (D2)
            return { ok: false, errorMsg: 'Gagal memuat data pengguna dari Supabase!' }; // S5
        }
        if (!data || data.length === 0) { // S6 (D3)
            return { ok: false, errorMsg: 'Username atau Password salah!' }; // S7
        }
        storage.setItem('kopisembilan_session', JSON.stringify(data[0])); // S8
        onSuccess('dashboard'); // S9
        return { ok: true, user: data[0] }; // S10
    } catch {
        return { ok: false, errorMsg: 'Koneksi ke server database gagal!' }; // S11
    }
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 2 (RQ-002 / FS-002): REGISTRASI AKUN PENGGUNA BARU (REGISTER)
// ══════════════════════════════════════════════════════════════════════════
async function registerUser({ fullName, username, password, confirmPassword }, { dbClient, storage, onSuccess }) {
    if (!fullName || !username || !password) { // S1 (D1)
        return { ok: false, errorMsg: 'Harap lengkapi semua kolom pendaftaran!' }; // S2
    }
    if (password.length < 6 || password !== confirmPassword) { // S3 (D2)
        return { ok: false, errorMsg: 'Password minimal 6 karakter dan konfirmasi harus cocok!' }; // S4
    }
    try {
        const { data: existing } = await dbClient.findExistingUser(username); // S5
        if (existing) { // S6 (D3)
            return { ok: false, errorMsg: 'Username sudah terdaftar di sistem!' }; // S7
        }
        const { data, error } = await dbClient.insertUser({ fullName, username, role: 'kasir' }); // S8
        if (error) { // S9 (D4)
            return { ok: false, errorMsg: `Registrasi gagal: ${error.message}` }; // S10
        }
        storage.setItem('kopisembilan_session', JSON.stringify(data[0])); // S11
        onSuccess('login'); // S12
        return { ok: true, user: data[0] }; // S13
    } catch {
        return { ok: false, errorMsg: 'Koneksi ke database gagal!' }; // S14
    }
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 3 (RQ-003 / FS-003): PEMULIHAN KATA SANDI MANDIRI (FORGOT PASSWORD)
// ══════════════════════════════════════════════════════════════════════════
async function resetUserPassword(username, newPassword, confirmPassword, { dbClient, notifier }) {
    if (!username || !newPassword || !confirmPassword) { // S1 (D1)
        return { ok: false, errorMsg: 'Harap lengkapi username dan password baru!' }; // S2
    }
    if (newPassword.length < 6 || newPassword !== confirmPassword) { // S3 (D2)
        return { ok: false, errorMsg: 'Password baru minimal 6 karakter dan konfirmasi harus cocok!' }; // S4
    }
    const { data: user } = await dbClient.findUserByUsername(username); // S5
    if (!user) { // S6 (D3)
        return { ok: false, errorMsg: 'Username akun tidak ditemukan!' }; // S7
    }
    const { error } = await dbClient.updatePassword(user.id, newPassword); // S8
    if (error) { // S9 (D4)
        return { ok: false, errorMsg: 'Gagal memperbarui password di database!' }; // S10
    }
    notifier.notify('Password akun berhasil diperbarui!'); // S11
    return { ok: true, resetSuccess: true }; // S12
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 4 (RQ-004 / FS-004): RINGKASAN PERFORMA TOKO REAL-TIME (DASHBOARD)
// ══════════════════════════════════════════════════════════════════════════
async function loadDashboardSummary({ dbClient, storage }) {
    const { data: trxs, error } = await dbClient.fetchTodayTransactions(); // S1
    if (error) { // S2 (D1)
        return { ok: false, errorMsg: 'Gagal memuat ringkasan dashboard!' }; // S3
    }
    if (!trxs || trxs.length === 0) { // S4 (D2)
        return { ok: true, totalRevenue: 0, totalOrders: 0, cashCount: 0, qrisCount: 0 }; // S5
    }
    let totalRevenue = 0, cashCount = 0, qrisCount = 0; // S6
    for (const t of trxs) { // S7
        totalRevenue += t.total; // S8
        if (t.method === 'CASH') { cashCount += 1; } else { qrisCount += 1; } // S9 (D3)
    }
    const summary = { ok: true, totalRevenue, totalOrders: trxs.length, cashCount, qrisCount }; // S10
    storage.setItem('kopisembilan_dashboard_cache', JSON.stringify(summary)); // S11
    return summary; // S12
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 5 (RQ-005 / FS-005): PENGELOLAAN KATALOG MENU KAFE (INVENTARIS PRODUK)
// ══════════════════════════════════════════════════════════════════════════
async function saveInventoryProduct(product, { dbClient, notifier, reload }) {
    if (!product.name || !product.category) { // S1 (D1)
        return { ok: false, message: 'Nama produk dan kategori wajib diisi!' }; // S2
    }
    if (typeof product.price !== 'number' || product.price < 1000 || product.price > 500000) { // S3 (D2)
        return { ok: false, message: 'Harga produk harus berada di antara Rp 1.000 - Rp 500.000!' }; // S4
    }
    const { error } = await dbClient.upsertProduct(product); // S5
    if (error) { // S6 (D3)
        return { ok: false, message: `Gagal menyimpan produk: ${error.message}` }; // S7
    }
    notifier.notify(`Produk ${product.name} berhasil disimpan!`); // S8
    reload(); // S9
    return { ok: true, product }; // S10
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 6 (RQ-006 / FS-006): MANAJEMEN PESANAN & PEMBAYARAN KASIR POS
// ══════════════════════════════════════════════════════════════════════════
function processCashierPayment(total, cashPaid, paymentMethod) {
    let status = ""; // S1
    let change = 0; // S2
    if (total > 0) { // S3 (D1)
        if (paymentMethod === "CASH") { // S4 (D2)
            if (cashPaid >= total) { // S5 (D3)
                status = "Lunas"; // S6
                change = cashPaid - total; // S7
            } else {
                status = "Jumlah Bayar Kurang"; // S8
            }
        } else if (paymentMethod === "QRIS") { // S9 (D4)
            status = "Lunas"; // S9
        } else {
            status = "Metode Tidak Valid"; // S10
        }
    } else {
        status = "Total Tidak Valid"; // S11
    }
    return { status, change }; // S12
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 7 (RQ-007 / FS-007): PEMANTAUAN HISTORI & FILTER LAPORAN KEUANGAN
// ══════════════════════════════════════════════════════════════════════════
async function generateFinancialReport(startDate, endDate, { dbClient, notifier }) {
    if (!startDate || !endDate || startDate > endDate) { // S1 (D1)
        return { ok: false, message: 'Rentang tanggal laporan tidak valid!' }; // S2
    }
    const { data: rows, error } = await dbClient.fetchTransactionsByRange(startDate, endDate); // S3
    if (error) { // S4 (D2)
        return { ok: false, message: `Gagal memuat laporan: ${error.message}` }; // S5
    }
    const filtered = rows.filter((r) => r.date >= startDate && r.date <= endDate); // S6
    const totalAmount = filtered.reduce((sum, r) => sum + r.total, 0); // S7
    if (filtered.length > 0) { // S8 (D3)
        notifier.notify(`Laporan berhasil dimuat (${filtered.length} transaksi)`); // S9
    }
    return { ok: true, count: filtered.length, totalAmount }; // S10
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 8 (RQ-008 / FS-008): MANAJEMEN PENGGUNA BERBASIS PERAN (RBAC ADMIN)
// ══════════════════════════════════════════════════════════════════════════
async function deleteStaffAccount(actorRole, targetId, { confirmFn, dbClient, notifier, reload }) {
    if (actorRole !== 'admin' || !targetId) { // S1 (D1)
        return { ok: false, message: 'Akses ditolak: Hanya Admin yang dapat menghapus akun!' }; // S2
    }
    if (!confirmFn('Hapus akun pengguna ini dari sistem?')) { // S3 (D2)
        return { ok: false, cancelled: true }; // S4
    }
    const { error } = await dbClient.deleteUser(targetId); // S5
    if (error) { // S6 (D3)
        return { ok: false, message: `Gagal menghapus akun: ${error.message}` }; // S7
    }
    notifier.notify('Akun pengguna berhasil dihapus!'); // S8
    reload(); // S9
    return { ok: true, deletedId: targetId }; // S10
}

module.exports = {
    loginUser,
    registerUser,
    resetUserPassword,
    loadDashboardSummary,
    saveInventoryProduct,
    processCashierPayment,
    generateFinancialReport,
    deleteStaffAccount
};
