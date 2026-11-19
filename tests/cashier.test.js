const test = require('node:test');
const assert = require('node:assert/strict');
const {
    validateLogin,
    validateRegister,
    validateResetPassword,
    calculateDashboardMetrics,
    validateProductInput,
    processCashierPayment,
    filterFinancialReport,
    validateUserManagement
} = require('../js/cashier.js');

/**
 * UNIT TESTING 8 FITUR IN-SCOPE - Cashier System UMKM Toko Kopi Sembilan
 * Pola: Arrange - Act - Assert (AAA)
 */

// ══════════════════════════════════════════════════════════════════════════
// 1. FITUR LOGIN (RQ-001)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 1 - Login [Positive]: Kredensial Admin Valid Berhasil Masuk', () => {
    // 1. Arrange
    const mockAdmin = { username: 'admin', password: 'password123', role: 'admin' };
    // 2. Act
    const res = validateLogin('admin', 'password123', mockAdmin);
    // 3. Assert
    assert.equal(res.success, true);
    assert.equal(res.role, 'admin');
});

test('Fitur 1 - Login [Negative]: Input Kosong & Password Salah Ditolak', () => {
    // 1. Arrange
    const mockAdmin = { username: 'admin', password: 'password123', role: 'admin' };
    // 2. Act
    const resEmpty = validateLogin('', 'password123', mockAdmin);
    const resWrong = validateLogin('admin', 'salah999', mockAdmin);
    // 3. Assert
    assert.equal(resEmpty.success, false);
    assert.equal(resWrong.success, false);
});

// ══════════════════════════════════════════════════════════════════════════
// 2. FITUR REGISTER (RQ-002)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 2 - Register [Positive]: Pendaftaran Akun Baru Valid Berhasil', () => {
    // 1. Arrange
    const existing = ['admin', 'kasir1'];
    // 2. Act
    const res = validateRegister('Nifail Eka Nafie', 'nifail_pos', 'kopi1234', 'kopi1234', existing);
    // 3. Assert
    assert.equal(res.success, true);
    assert.equal(res.message, 'Registrasi berhasil');
});

test('Fitur 2 - Register [Negative]: Kolom Kosong, Password Pendek, Konfirmasi Beda & Duplikat', () => {
    // 1. Arrange
    const existing = ['admin', 'kasir1'];
    // 2. Act
    const resEmpty = validateRegister('', 'user2', 'kopi1234', 'kopi1234', existing);
    const resShort = validateRegister('Budi', 'user2', '123', '123', existing);
    const resMismatch = validateRegister('Budi', 'user2', 'kopi1234', 'beda1234', existing);
    const resDup = validateRegister('Budi', 'admin', 'kopi1234', 'kopi1234', existing);
    // 3. Assert
    assert.equal(resEmpty.success, false);
    assert.equal(resShort.success, false);
    assert.equal(resMismatch.success, false);
    assert.equal(resDup.success, false);
});

// ══════════════════════════════════════════════════════════════════════════
// 3. FITUR FORGOT PASSWORD (RQ-003)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 3 - Forgot Password [Positive]: Pembaruan Password Mandiri Berhasil', () => {
    // 1. Arrange
    const existing = ['admin', 'kasir1'];
    // 2. Act
    const res = validateResetPassword('admin', 'newpass123', 'newpass123', existing);
    // 3. Assert
    assert.equal(res.success, true);
    assert.equal(res.message, 'Password berhasil diperbarui');
});

test('Fitur 3 - Forgot Password [Negative]: Input Kosong, User Tidak Ada, Password Pendek & Beda', () => {
    // 1. Arrange
    const existing = ['admin'];
    // 2. Act
    const resEmpty = validateResetPassword('', 'newpass123', 'newpass123', existing);
    const resNotFound = validateResetPassword('unknown', 'newpass123', 'newpass123', existing);
    const resShort = validateResetPassword('admin', '123', '123', existing);
    const resMismatch = validateResetPassword('admin', 'newpass123', 'beda123', existing);
    // 3. Assert
    assert.equal(resEmpty.success, false);
    assert.equal(resNotFound.success, false);
    assert.equal(resShort.success, false);
    assert.equal(resMismatch.success, false);
});

// ══════════════════════════════════════════════════════════════════════════
// 4. FITUR DASHBOARD (RQ-004)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 4 - Dashboard [Positive & Negative]: Kalkulasi Ringkasan Omzet & Data Kosong', () => {
    // 1. Arrange
    const trxs = [
        { total: 50000, method: 'CASH' },
        { total: 30000, method: 'QRIS' }
    ];
    // 2. Act
    const stats = calculateDashboardMetrics(trxs);
    const emptyStats = calculateDashboardMetrics([]);
    // 3. Assert
    assert.equal(stats.totalRevenue, 80000);
    assert.equal(stats.totalOrders, 2);
    assert.equal(stats.averageOrder, 40000);
    assert.equal(stats.cashCount, 1);
    assert.equal(stats.qrisCount, 1);
    assert.equal(emptyStats.totalRevenue, 0);
});

// ══════════════════════════════════════════════════════════════════════════
// 5. FITUR INVENTARIS PRODUK (RQ-005)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 5 - Inventaris Produk [Positive & Negative]: Validasi Tambah Produk & Batas Harga', () => {
    // 1. Arrange & 2. Act
    const resValid = validateProductInput('Kopi Susu Gula Aren', 'Signature Coffee', 18000);
    const resEmpty = validateProductInput('', 'Signature Coffee', 18000);
    const resInvalidPrice = validateProductInput('Kopi Sultan', 'Signature Coffee', 750000);
    // 3. Assert
    assert.equal(resValid.valid, true);
    assert.equal(resEmpty.valid, false);
    assert.equal(resInvalidPrice.valid, false);
});

// ══════════════════════════════════════════════════════════════════════════
// 6. FITUR MANAJEMEN PESANAN / KASIR POS (RQ-006 - 5 Basis Paths TC-01..TC-05)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 6 - Kasir POS TC-01 [Positive]: Bayar Tunai Uang Lebih (Lunas & Kembalian 50000)', () => {
    // 1. Arrange
    const total = 50000, cashPaid = 100000, paymentMethod = 'CASH';
    // 2. Act
    const result = processCashierPayment(total, cashPaid, paymentMethod);
    // 3. Assert
    assert.equal(result.status, 'Lunas');
    assert.equal(result.change, 50000);
});

test('Fitur 6 - Kasir POS TC-02 [Negative]: Bayar Tunai Uang Kurang (Ditolak & Kembalian 0)', () => {
    // 1. Arrange
    const total = 50000, cashPaid = 40000, paymentMethod = 'CASH';
    // 2. Act
    const result = processCashierPayment(total, cashPaid, paymentMethod);
    // 3. Assert
    assert.equal(result.status, 'Jumlah Bayar Kurang');
    assert.equal(result.change, 0);
});

test('Fitur 6 - Kasir POS TC-03 [Positive]: Bayar Nontunai QRIS (Status Lunas & Kembalian 0)', () => {
    // 1. Arrange
    const total = 50000, cashPaid = 0, paymentMethod = 'QRIS';
    // 2. Act
    const result = processCashierPayment(total, cashPaid, paymentMethod);
    // 3. Assert
    assert.equal(result.status, 'Lunas');
    assert.equal(result.change, 0);
});

test('Fitur 6 - Kasir POS TC-04 & TC-05 [Negative]: Metode Tidak Valid & Total Tagihan <= 0', () => {
    // 1. Arrange & 2. Act
    const resInvalidMethod = processCashierPayment(50000, 50000, 'DEBIT');
    const resInvalidTotal = processCashierPayment(0, 50000, 'CASH');
    // 3. Assert
    assert.equal(resInvalidMethod.status, 'Metode Tidak Valid');
    assert.equal(resInvalidTotal.status, 'Total Tidak Valid');
});

// ══════════════════════════════════════════════════════════════════════════
// 7. FITUR LAPORAN KEUANGAN (RQ-007)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 7 - Laporan Keuangan [Positive & Negative]: Filter Rentang Tanggal & Akumulasi', () => {
    // 1. Arrange
    const trxs = [
        { date: '2026-11-01', total: 45000 },
        { date: '2026-11-15', total: 55000 },
        { date: '2026-12-01', total: 30000 }
    ];
    // 2. Act
    const resValid = filterFinancialReport(trxs, '2026-11-01', '2026-11-30');
    const resInvalidDate = filterFinancialReport(trxs, '2026-11-30', '2026-11-01');
    // 3. Assert
    assert.equal(resValid.valid, true);
    assert.equal(resValid.count, 2);
    assert.equal(resValid.totalAmount, 100000);
    assert.equal(resInvalidDate.valid, false);
});

// ══════════════════════════════════════════════════════════════════════════
// 8. FITUR MANAJEMEN PENGGUNA / RBAC (RQ-008)
// ══════════════════════════════════════════════════════════════════════════
test('Fitur 8 - Manajemen Pengguna [Positive & Negative]: Otorisasi RBAC Admin & Validasi Role', () => {
    // 1. Arrange & 2. Act
    const resAllowed = validateUserManagement('admin', 'kasir_baru', 'kasir');
    const resDeniedRole = validateUserManagement('kasir', 'kasir_baru', 'kasir');
    const resInvalidTarget = validateUserManagement('admin', '', 'guest');
    // 3. Assert
    assert.equal(resAllowed.allowed, true);
    assert.equal(resDeniedRole.allowed, false);
    assert.equal(resInvalidTarget.allowed, false);
});
