const test = require('node:test');
const assert = require('node:assert/strict');
const {
    loginUser,
    registerUser,
    resetUserPassword,
    loadDashboardSummary,
    saveInventoryProduct,
    processCashierPayment,
    generateFinancialReport,
    deleteStaffAccount
} = require('../js/cashier.js');

/**
 * TEST DOUBLES HELPER (Stub, Fake, Mock)
 */
class FakeLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key];
    }
    setItem(key, val) {
        this.store[key] = String(val);
    }
}

function createMockFn() {
    const fn = (...args) => {
        fn.calls.push(args);
    };
    fn.calls = [];
    return fn;
}

// ══════════════════════════════════════════════════════════════════════════
// FITUR 1 (RQ-001): LOGIN (TC-L01 .. TC-L05)
// ══════════════════════════════════════════════════════════════════════════
test('TC-L01 [Negative]: should reject empty username or password', async () => {
    // Arrange
    const dbStub = { findUser: createMockFn() };
    const deps = { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() };
    // Act
    const res = await loginUser('', 'admin123', deps);
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Username dan password wajib diisi!' });
    assert.equal(dbStub.findUser.calls.length, 0);
});

test('TC-L02 [Negative]: should handle database query error via Stub', async () => {
    // Arrange (STUB returning DB error)
    const dbStub = { findUser: async () => ({ data: null, error: { message: 'timeout' } }) };
    const onSuccessMock = createMockFn();
    // Act
    const res = await loginUser('admin', 'admin123', { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: onSuccessMock });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Gagal memuat data pengguna dari Supabase!' });
    assert.equal(onSuccessMock.calls.length, 0);
});

test('TC-L03 [Negative]: should reject wrong credentials when DB returns empty array', async () => {
    // Arrange (STUB returning empty data)
    const dbStub = { findUser: async () => ({ data: [], error: null }) };
    // Act
    const res = await loginUser('admin', 'wrongpass', { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Username atau Password salah!' });
});

test('TC-L04 [Positive]: should login valid admin, save to FakeLocalStorage, and invoke onSuccess Mock', async () => {
    // Arrange
    const adminUser = { id: 1, username: 'admin', role: 'admin' };
    const dbStub = { findUser: async () => ({ data: [adminUser], error: null }) };
    const storage = new FakeLocalStorage();
    const onSuccessMock = createMockFn();
    // Act
    const res = await loginUser('admin', 'admin123', { dbClient: dbStub, storage, onSuccess: onSuccessMock });
    // Assert
    assert.deepEqual(res, { ok: true, user: adminUser });
    assert.equal(JSON.parse(storage.getItem('kopisembilan_session')).username, 'admin');
    assert.equal(onSuccessMock.calls.length, 1);
    assert.equal(onSuccessMock.calls[0][0], 'dashboard');
});

test('TC-L05 [Negative]: should catch network exception during login', async () => {
    // Arrange
    const dbStub = { findUser: async () => { throw new Error('Network offline'); } };
    // Act
    const res = await loginUser('admin', 'admin123', { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Koneksi ke server database gagal!' });
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 2 (RQ-002): REGISTER (TC-R01 .. TC-R06)
// ══════════════════════════════════════════════════════════════════════════
test('TC-R01 [Negative]: should reject incomplete registration fields', async () => {
    // Arrange & Act
    const res = await registerUser(
        { fullName: '', username: 'kasir1', password: 'password1', confirmPassword: 'password1' },
        { dbClient: {}, storage: new FakeLocalStorage(), onSuccess: createMockFn() }
    );
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Harap lengkapi semua kolom pendaftaran!' });
});

test('TC-R02 [Negative]: should reject short or mismatched password and confirmPassword', async () => {
    // Arrange & Act
    const res = await registerUser(
        { fullName: 'Budi', username: 'budi', password: 'password1', confirmPassword: 'password2' },
        { dbClient: {}, storage: new FakeLocalStorage(), onSuccess: createMockFn() }
    );
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Password minimal 6 karakter dan konfirmasi harus cocok!' });
});

test('TC-R03 [Negative]: should reject duplicate username via Stub', async () => {
    // Arrange
    const dbStub = { findExistingUser: async () => ({ data: { username: 'budi' } }) };
    // Act
    const res = await registerUser(
        { fullName: 'Budi', username: 'budi', password: 'password1', confirmPassword: 'password1' },
        { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() }
    );
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Username sudah terdaftar di sistem!' });
});

test('TC-R04 [Negative]: should handle database insert error during registration', async () => {
    // Arrange
    const dbStub = {
        findExistingUser: async () => ({ data: null }),
        insertUser: async () => ({ data: null, error: { message: 'constraint error' } })
    };
    // Act
    const res = await registerUser(
        { fullName: 'Budi', username: 'budi', password: 'password1', confirmPassword: 'password1' },
        { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() }
    );
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Registrasi gagal: constraint error' });
});

test('TC-R05 [Positive]: should register valid new user, store session in FakeLocalStorage & call Mock', async () => {
    // Arrange
    const newUser = { id: 2, fullName: 'Budi', username: 'budi', role: 'kasir' };
    const dbStub = {
        findExistingUser: async () => ({ data: null }),
        insertUser: async () => ({ data: [newUser], error: null })
    };
    const storage = new FakeLocalStorage();
    const onSuccessMock = createMockFn();
    // Act
    const res = await registerUser(
        { fullName: 'Budi', username: 'budi', password: 'password1', confirmPassword: 'password1' },
        { dbClient: dbStub, storage, onSuccess: onSuccessMock }
    );
    // Assert
    assert.deepEqual(res, { ok: true, user: newUser });
    assert.equal(JSON.parse(storage.getItem('kopisembilan_session')).username, 'budi');
    assert.equal(onSuccessMock.calls[0][0], 'login');
});

test('TC-R06 [Negative]: should catch database connection exception during registration', async () => {
    // Arrange
    const dbStub = { findExistingUser: async () => { throw new Error('DB down'); } };
    // Act
    const res = await registerUser(
        { fullName: 'Budi', username: 'budi', password: 'password1', confirmPassword: 'password1' },
        { dbClient: dbStub, storage: new FakeLocalStorage(), onSuccess: createMockFn() }
    );
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Koneksi ke database gagal!' });
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 3 (RQ-003): FORGOT PASSWORD (TC-F01 .. TC-F05)
// ══════════════════════════════════════════════════════════════════════════
test('TC-F01 [Negative]: should reject empty username or password fields', async () => {
    // Arrange & Act
    const res = await resetUserPassword('', 'newpass123', 'newpass123', { dbClient: {}, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Harap lengkapi username dan password baru!' });
});

test('TC-F02 [Negative]: should reject short or mismatched new password', async () => {
    // Arrange & Act
    const res = await resetUserPassword('admin', 'newpass123', 'beda999', { dbClient: {}, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Password baru minimal 6 karakter dan konfirmasi harus cocok!' });
});

test('TC-F03 [Negative]: should return not found when username does not exist via Stub', async () => {
    // Arrange
    const dbStub = { findUserByUsername: async () => ({ data: null }) };
    // Act
    const res = await resetUserPassword('unknown', 'newpass123', 'newpass123', { dbClient: dbStub, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Username akun tidak ditemukan!' });
});

test('TC-F04 [Negative]: should handle database error during password update', async () => {
    // Arrange
    const dbStub = {
        findUserByUsername: async () => ({ data: { id: 1, username: 'admin' } }),
        updatePassword: async () => ({ error: { message: 'update failed' } })
    };
    // Act
    const res = await resetUserPassword('admin', 'newpass123', 'newpass123', { dbClient: dbStub, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Gagal memperbarui password di database!' });
});

test('TC-F05 [Positive]: should update password and trigger notifier Mock', async () => {
    // Arrange
    const dbStub = {
        findUserByUsername: async () => ({ data: { id: 1, username: 'admin' } }),
        updatePassword: async () => ({ error: null })
    };
    const notifierMock = { notify: createMockFn() };
    // Act
    const res = await resetUserPassword('admin', 'newpass123', 'newpass123', { dbClient: dbStub, notifier: notifierMock });
    // Assert
    assert.deepEqual(res, { ok: true, resetSuccess: true });
    assert.equal(notifierMock.notify.calls[0][0], 'Password akun berhasil diperbarui!');
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 4 (RQ-004): DASHBOARD (TC-D01 .. TC-D03)
// ══════════════════════════════════════════════════════════════════════════
test('TC-D01 [Negative]: should return error when dashboard transaction fetch fails', async () => {
    // Arrange
    const dbStub = { fetchTodayTransactions: async () => ({ data: null, error: { message: 'err' } }) };
    // Act
    const res = await loadDashboardSummary({ dbClient: dbStub, storage: new FakeLocalStorage() });
    // Assert
    assert.deepEqual(res, { ok: false, errorMsg: 'Gagal memuat ringkasan dashboard!' });
});

test('TC-D02 [Positive/Edge]: should return zeroed metrics when transaction list is empty', async () => {
    // Arrange
    const dbStub = { fetchTodayTransactions: async () => ({ data: [], error: null }) };
    // Act
    const res = await loadDashboardSummary({ dbClient: dbStub, storage: new FakeLocalStorage() });
    // Assert
    assert.deepEqual(res, { ok: true, totalRevenue: 0, totalOrders: 0, cashCount: 0, qrisCount: 0 });
});

test('TC-D03 [Positive]: should aggregate revenue, CASH/QRIS counts, and cache in FakeLocalStorage', async () => {
    // Arrange
    const trxs = [
        { id: 1, total: 50000, method: 'CASH' },
        { id: 2, total: 30000, method: 'QRIS' }
    ];
    const dbStub = { fetchTodayTransactions: async () => ({ data: trxs, error: null }) };
    const storage = new FakeLocalStorage();
    // Act
    const res = await loadDashboardSummary({ dbClient: dbStub, storage });
    // Assert
    assert.deepEqual(res, { ok: true, totalRevenue: 80000, totalOrders: 2, cashCount: 1, qrisCount: 1 });
    assert.equal(JSON.parse(storage.getItem('kopisembilan_dashboard_cache')).totalRevenue, 80000);
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 5 (RQ-005): INVENTARIS PRODUK (TC-I01 .. TC-I04)
// ══════════════════════════════════════════════════════════════════════════
test('TC-I01 [Negative]: should reject empty product name or category', async () => {
    // Arrange
    const notifierMock = { notify: createMockFn() };
    // Act
    const res = await saveInventoryProduct({ name: '', category: 'Coffee', price: 18000 }, { dbClient: {}, notifier: notifierMock, reload: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Nama produk dan kategori wajib diisi!' });
    assert.equal(notifierMock.notify.calls.length, 0);
});

test('TC-I02 [Negative]: should reject product price outside Rp 1.000 - Rp 500.000', async () => {
    // Arrange & Act
    const res = await saveInventoryProduct({ name: 'Kopi Sultan', category: 'Coffee', price: 750000 }, { dbClient: {}, notifier: { notify: createMockFn() }, reload: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Harga produk harus berada di antara Rp 1.000 - Rp 500.000!' });
});

test('TC-I03 [Negative]: should return error message when upsertProduct Stub fails', async () => {
    // Arrange
    const dbStub = { upsertProduct: async () => ({ error: { message: 'duplicate SKU' } }) };
    const reloadMock = createMockFn();
    // Act
    const res = await saveInventoryProduct({ name: 'Kopi Susu', category: 'Coffee', price: 18000 }, { dbClient: dbStub, notifier: { notify: createMockFn() }, reload: reloadMock });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Gagal menyimpan produk: duplicate SKU' });
    assert.equal(reloadMock.calls.length, 0);
});

test('TC-I04 [Positive]: should save valid product, notify, and reload catalog via Mocks', async () => {
    // Arrange
    const product = { name: 'Kopi Susu Gula Aren', category: 'Signature Coffee', price: 18000 };
    const dbStub = { upsertProduct: async () => ({ error: null }) };
    const notifierMock = { notify: createMockFn() };
    const reloadMock = createMockFn();
    // Act
    const res = await saveInventoryProduct(product, { dbClient: dbStub, notifier: notifierMock, reload: reloadMock });
    // Assert
    assert.deepEqual(res, { ok: true, product });
    assert.equal(notifierMock.notify.calls[0][0], 'Produk Kopi Susu Gula Aren berhasil disimpan!');
    assert.equal(reloadMock.calls.length, 1);
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 6 (RQ-006): MANAJEMEN PESANAN / KASIR POS (TC-01 .. TC-05)
// ══════════════════════════════════════════════════════════════════════════
test('TC-01 [Positive]: should return Lunas and accurate change for sufficient CASH payment', () => {
    // Arrange & Act
    const res = processCashierPayment(50000, 100000, 'CASH');
    // Assert
    assert.deepEqual(res, { status: 'Lunas', change: 50000 });
});

test('TC-02 [Negative]: should reject insufficient CASH payment with change 0', () => {
    // Arrange & Act
    const res = processCashierPayment(50000, 40000, 'CASH');
    // Assert
    assert.deepEqual(res, { status: 'Jumlah Bayar Kurang', change: 0 });
});

test('TC-03 [Positive]: should return Lunas and change 0 for QRIS payment', () => {
    // Arrange & Act
    const res = processCashierPayment(50000, 0, 'QRIS');
    // Assert
    assert.deepEqual(res, { status: 'Lunas', change: 0 });
});

test('TC-04 [Negative]: should reject unsupported payment method DEBIT', () => {
    // Arrange & Act
    const res = processCashierPayment(50000, 50000, 'DEBIT');
    // Assert
    assert.deepEqual(res, { status: 'Metode Tidak Valid', change: 0 });
});

test('TC-05 [Negative]: should reject zero or negative order total', () => {
    // Arrange & Act
    const res = processCashierPayment(0, 50000, 'CASH');
    // Assert
    assert.deepEqual(res, { status: 'Total Tidak Valid', change: 0 });
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 7 (RQ-007): LAPORAN KEUANGAN (TC-K01 .. TC-K04)
// ══════════════════════════════════════════════════════════════════════════
test('TC-K01 [Negative]: should reject invalid or reversed date range', async () => {
    // Arrange & Act
    const res = await generateFinancialReport('2026-11-30', '2026-11-01', { dbClient: {}, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Rentang tanggal laporan tidak valid!' });
});

test('TC-K02 [Negative]: should return error when transaction range query Stub fails', async () => {
    // Arrange
    const dbStub = { fetchTransactionsByRange: async () => ({ data: null, error: { message: 'query error' } }) };
    // Act
    const res = await generateFinancialReport('2026-11-01', '2026-11-30', { dbClient: dbStub, notifier: { notify: createMockFn() } });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Gagal memuat laporan: query error' });
});

test('TC-K03 [Positive/Edge]: should handle empty filtered report without invoking notifier Mock', async () => {
    // Arrange
    const dbStub = { fetchTransactionsByRange: async () => ({ data: [], error: null }) };
    const notifierMock = { notify: createMockFn() };
    // Act
    const res = await generateFinancialReport('2026-11-01', '2026-11-30', { dbClient: dbStub, notifier: notifierMock });
    // Assert
    assert.deepEqual(res, { ok: true, count: 0, totalAmount: 0 });
    assert.equal(notifierMock.notify.calls.length, 0);
});

test('TC-K04 [Positive]: should filter transactions by date range, sum total, and invoke notifier Mock', async () => {
    // Arrange
    const rows = [
        { date: '2026-11-05', total: 45000 },
        { date: '2026-11-18', total: 55000 }
    ];
    const dbStub = { fetchTransactionsByRange: async () => ({ data: rows, error: null }) };
    const notifierMock = { notify: createMockFn() };
    // Act
    const res = await generateFinancialReport('2026-11-01', '2026-11-30', { dbClient: dbStub, notifier: notifierMock });
    // Assert
    assert.deepEqual(res, { ok: true, count: 2, totalAmount: 100000 });
    assert.equal(notifierMock.notify.calls[0][0], 'Laporan berhasil dimuat (2 transaksi)');
});

// ══════════════════════════════════════════════════════════════════════════
// FITUR 8 (RQ-008): MANAJEMEN PENGGUNA / RBAC (TC-U01 .. TC-U04)
// ══════════════════════════════════════════════════════════════════════════
test('TC-U01 [Negative]: should deny non-admin role or missing target ID', async () => {
    // Arrange & Act
    const res = await deleteStaffAccount('kasir', 5, { confirmFn: createMockFn(), dbClient: {}, notifier: { notify: createMockFn() }, reload: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Akses ditolak: Hanya Admin yang dapat menghapus akun!' });
});

test('TC-U02 [Negative]: should cancel deletion when confirmStub returns false', async () => {
    // Arrange
    const confirmStub = () => false;
    const dbMock = { deleteUser: createMockFn() };
    // Act
    const res = await deleteStaffAccount('admin', 5, { confirmFn: confirmStub, dbClient: dbMock, notifier: { notify: createMockFn() }, reload: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, cancelled: true });
    assert.equal(dbMock.deleteUser.calls.length, 0);
});

test('TC-U03 [Negative]: should return error when deleteUser Stub fails', async () => {
    // Arrange
    const dbStub = { deleteUser: async () => ({ error: { message: 'foreign key constraint' } }) };
    // Act
    const res = await deleteStaffAccount('admin', 5, { confirmFn: () => true, dbClient: dbStub, notifier: { notify: createMockFn() }, reload: createMockFn() });
    // Assert
    assert.deepEqual(res, { ok: false, message: 'Gagal menghapus akun: foreign key constraint' });
});

test('TC-U04 [Positive]: should delete staff account, notify, and reload user table via Mocks', async () => {
    // Arrange
    const dbStub = { deleteUser: async () => ({ error: null }) };
    const notifierMock = { notify: createMockFn() };
    const reloadMock = createMockFn();
    // Act
    const res = await deleteStaffAccount('admin', 5, { confirmFn: () => true, dbClient: dbStub, notifier: notifierMock, reload: reloadMock });
    // Assert
    assert.deepEqual(res, { ok: true, deletedId: 5 });
    assert.equal(notifierMock.notify.calls[0][0], 'Akun pengguna berhasil dihapus!');
    assert.equal(reloadMock.calls.length, 1);
});
