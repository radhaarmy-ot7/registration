const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const { authMiddleware } = require("../middleware/auth");
const { readData, writeData } = require("../utils/fileStorage");

const router = express.Router();

// Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
=========================
CREATE ORDER
POST /api/payments/create-order
=========================
*/
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, eventName } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    const payments = readData("payments.json");

    const payment = {
      id: Date.now().toString(),
      user: req.user.id,
      razorpayOrderId: order.id,
      razorpayPaymentId: "",
      razorpaySignature: "",
      amount,
      currency: "INR",
      eventName: eventName || "Tech Conference 2024",
      status: "pending",
      createdAt: new Date(),
    };

    payments.push(payment);

    writeData("payments.json", payments);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
});

/*
=========================
VERIFY PAYMENT
POST /api/payments/verify
=========================
*/
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    const payments = readData("payments.json");

    const payment = payments.find(
      (p) =>
        p.razorpayOrderId === razorpay_order_id
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (
      expectedSignature === razorpay_signature
    ) {
      payment.razorpayPaymentId =
        razorpay_payment_id;

      payment.razorpaySignature =
        razorpay_signature;

      payment.status = "success";

      writeData("payments.json", payments);

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    payment.status = "failed";

    writeData("payments.json", payments);

    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Verification failed",
    });
  }
});

/*
=========================
GET ALL PAYMENTS
GET /api/payments/all
=========================
*/
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const payments = readData("payments.json");

    const sortedPayments = payments.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json(sortedPayments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/*
=========================
GET MY PAYMENTS
GET /api/payments/my-payments
=========================
*/
router.get(
  "/my-payments",
  authMiddleware,
  async (req, res) => {
    try {
      const payments =
        readData("payments.json");

      const myPayments = payments
        .filter(
          (payment) =>
            payment.user === req.user.id
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

      res.json(myPayments);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

module.exports = router;