const test = require('node:test');
const assert = require('node:assert/strict');
const { processCashierPayment } = require('../js/cashier.js');

/**
 * TEST DOUBLE IMPLEMENTATION (Modul 4 Bagian 3)
 * Pola Arrange-Act-Assert (AAA)
 * 1. Stub: Service verifikasi QRIS (isolasi dependensi gateway eksternal)
 * 2. Mock: Service audit log transaksi kasir (verifikasi perilaku & interaksi)
 */

// 1. STUB Implementation
class PaymentGatewayStub {
    async verifyPayment(transactionId) {
        // Mengembalikan predefined response tanpa query live network
        return { success: true, transactionId, status: "PAID" };
    }
}

// 2. MOCK Implementation
class TransactionLoggerMock {
    constructor() {
        this.calls = [];
    }
    logTransaction(orderData) {
        this.calls.push(orderData);
    }
    verifyCalledOnce() {
        assert.equal(this.calls.length, 1, "Logger harus dipanggil tepat 1 kali");
    }
    getLastCall() {
        return this.calls[this.calls.length - 1];
    }
}

test('Test Double 1 - STUB: Memverifikasi Pembayaran QRIS via Gateway Stub', async () => {
    // 1. Arrange
    const gatewayStub = new PaymentGatewayStub();
    const trxId = "TRX-KOPISMB-9901";

    // 2. Act
    const verification = await gatewayStub.verifyPayment(trxId);
    const paymentResult = processCashierPayment(35000, 0, "QRIS");

    // 3. Assert
    assert.equal(verification.status, "PAID");
    assert.equal(paymentResult.status, "Lunas");
    assert.equal(paymentResult.change, 0);
});

test('Test Double 2 - MOCK: Memverifikasi Interaksi Audit Log Transaksi Kasir', () => {
    // 1. Arrange
    const loggerMock = new TransactionLoggerMock();
    const total = 50000;
    const cashPaid = 100000;
    const paymentMethod = "CASH";

    // 2. Act
    const paymentResult = processCashierPayment(total, cashPaid, paymentMethod);
    loggerMock.logTransaction({
        total,
        cashPaid,
        change: paymentResult.change,
        status: paymentResult.status
    });

    // 3. Assert (Behavioral Verification)
    loggerMock.verifyCalledOnce();
    const record = loggerMock.getLastCall();
    assert.equal(record.status, "Lunas");
    assert.equal(record.change, 50000);
});
