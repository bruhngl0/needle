"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/cartpage.scss";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const shippingFee = cartSubtotal >= 150 || cartSubtotal === 0 ? 0 : 15;
  const totalAmount = cartSubtotal + shippingFee;

  const handleCheckoutClick = () => {
    if (user) {
      router.push("/checkout");
    } else {
      // Redirect to login with checkout return page
      router.push("/login?redirect=checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-empty">
        <span className="empty-icon">👜</span>
        <h2>Your Shopping Bag is Empty</h2>
        <p>You haven&apos;t added any designs to your bag yet.</p>
        <Link href="/shop" className="explore-btn">
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Your Shopping Bag</h1>

        <div className="cart-grid">
          {/* Left Side: Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-headers">
              <span>Product</span>
              <span className="hide-mobile">Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            <div className="items-list">
              {cartItems.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="cart-item-row">
                  {/* Product Info */}
                  <div className="item-product-details">
                    <img src={"/" + item.image.replace(/^\//, "")} alt={item.name} className="item-img" />
                    <div className="item-meta">
                      <Link href={`/product/${item.product_id}`} className="item-name">
                        {item.name}
                      </Link>
                      <span className="item-size">Size: {item.size}</span>
                      <span className="item-price-mobile show-mobile">
                        Price: ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.size)}
                        className="item-remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price (Desktop) */}
                  <div className="item-price-col hide-mobile">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Quantity Controls */}
                  <div className="item-qty-col">
                    <div className="qty-picker-small">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                        className="qty-small-btn"
                      >
                        -
                      </button>
                      <span className="qty-small-val">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                        className="qty-small-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="item-total-col">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer-links">
              <Link href="/shop" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="cart-summary-section">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            {shippingFee > 0 && (
              <p className="shipping-notice">
                Add <strong>${(150 - cartSubtotal).toFixed(2)}</strong> more to unlock FREE shipping.
              </p>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckoutClick} className="checkout-btn">
              {user ? "Proceed to Checkout" : "Log In to Checkout"}
            </button>

            <div className="secure-checkout">
              <span className="lock-icon">🔒</span>
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
