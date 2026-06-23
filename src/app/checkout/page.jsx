"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/checkout.scss";

const Checkout = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    shipping_name: user?.name || "",
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // If not logged in, redirect to login
    if (!token) {
      router.push("/login?redirect=checkout");
    }
    // If cart is empty, redirect to cart page
    if (cartItems.length === 0 && !success) {
      router.push("/cart");
    }
  }, [token, cartItems, success, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const shippingFee = cartSubtotal >= 150 ? 0 : 15;
  const totalAmount = cartSubtotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { shipping_name, shipping_address, shipping_city, shipping_zip, cardNumber, expiryDate, cvv } = formData;

    if (!shipping_name || !shipping_address || !shipping_city || !shipping_zip) {
      setError("Please fill out all shipping details.");
      return;
    }

    if (!cardNumber || !expiryDate || !cvv) {
      setError("Please input valid payment card credentials.");
      return;
    }

    setLoading(true);

    try {
      // Map cartItems to what the backend expects
      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_zip,
          items: orderItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process order.");
      }

      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Submit order error:", err);
      setError(err.message || "Something went wrong processing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success-page">
        <div className="success-card">
          <span className="success-icon">✓</span>
          <h2>Thank You For Your Order!</h2>
          <p className="order-number">Order reference: <strong>#NDL-{orderId}</strong></p>
          <p className="success-msg">
            Your tailoring order has been successfully logged. We are preparing your items inside our workshop and will dispatch them shortly.
          </p>
          <div className="redirect-countdown">
            <p>Redirecting to your order logs...</p>
            <Link href="/profile" className="view-orders-btn">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Secured Checkout</h1>

        {error && <div className="checkout-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout-grid">
          {/* Left Side: Shipping & Billing Details */}
          <div className="checkout-form-section">
            <h3 className="section-subtitle">1. Delivery Address</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="shipping_name"
                value={formData.shipping_name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="123 Fashion Blvd, Apt 4B"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  placeholder="New York"
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP / Postal Code</label>
                <input
                  type="text"
                  name="shipping_zip"
                  value={formData.shipping_zip}
                  onChange={handleChange}
                  placeholder="10001"
                  required
                />
              </div>
            </div>

            <h3 className="section-subtitle spacing-top">2. Payment Method</h3>
            <div className="payment-card-mockup">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4111 2222 3333 4444"
                  maxLength="19"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="checkout-summary-section">
            <h3 className="summary-title">Summary Review</h3>

            <div className="checkout-items-preview">
              {cartItems.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="preview-row">
                  <img src={"/" + item.image.replace(/^\//, "")} alt={item.name} className="preview-img" />
                  <div className="preview-meta">
                    <span className="preview-name">{item.name}</span>
                    <span className="preview-details">Size: {item.size} × {item.quantity}</span>
                  </div>
                  <span className="preview-total">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Cart Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row grand-total">
              <span>Grand Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <button type="submit" disabled={loading} className="place-order-btn">
              {loading ? "Authorizing Funds..." : `Authorize Payment • $${totalAmount.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
