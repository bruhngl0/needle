"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/profile.scss";

const Profile = () => {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load your order files");
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Fetch profile orders error:", err);
        setError("Error pulling order logs. Make sure the server database is reachable.");
      } finally {
        setLoadingOrders(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token, authLoading, router]);

  if (authLoading || (token && loadingOrders && orders.length === 0)) {
    return (
      <div className="profile-loading-screen">
        <div className="spinner"></div>
        <p>Verifying identity credentials...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User profile details header */}
        <section className="profile-header-card">
          <div className="user-avatar-placeholder">
            {user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="user-meta-details">
            <span className="profile-greeting">Customer Account</span>
            <h1 className="user-name">{user?.name}</h1>
            <p className="user-email">✉ {user?.email}</p>
            {user?.role === "admin" && <span className="admin-pill">Needle Admin Access</span>}
          </div>
        </section>

        {/* Order history */}
        <section className="order-history-section">
          <h2 className="section-title">Order Ledger</h2>

          {error && <div className="profile-error-banner">{error}</div>}

          {orders.length === 0 ? (
            <div className="empty-orders-box">
              <span className="box-icon">📜</span>
              <h3>No Transactions Logged</h3>
              <p>You haven&apos;t placed any fashion orders with this profile yet.</p>
              <Link href="/shop" className="shop-link-btn">
                Visit Shop Catalog
              </Link>
            </div>
          ) : (
            <div className="orders-ledger-list">
              {orders.map((order) => (
                <div key={order.id} className="ledger-order-card">
                  {/* Order Top Bar */}
                  <div className="order-card-header">
                    <div>
                      <p className="meta-label">Order Ref</p>
                      <p className="meta-val">#NDL-{order.id}</p>
                    </div>
                    <div>
                      <p className="meta-label">Date Placed</p>
                      <p className="meta-val">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="meta-label">Grand Total</p>
                      <p className="meta-val highlight">${order.total_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="meta-label">Status</p>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="order-card-body">
                    <div className="order-shipment-details">
                      <h4 className="detail-sub-title">Delivery Location</h4>
                      <p className="ship-to">Recipient: <strong>{order.shipping_name}</strong></p>
                      <p className="ship-address">
                        {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
                      </p>
                    </div>

                    <div className="order-items-details">
                      <h4 className="detail-sub-title">Purchased Items</h4>
                      <div className="purchased-items-list">
                        {order.items.map((item) => (
                          <div key={`${item.id}-${item.size}`} className="purchased-item-row">
                            <img
                              src={`/${item.product_image}`}
                              alt={item.product_name}
                              className="purchased-item-img"
                            />
                            <div className="purchased-item-info">
                              <p className="item-name">{item.product_name}</p>
                              <p className="item-specs">
                                Size: <strong>{item.size}</strong> | Qty: <strong>{item.quantity}</strong>
                              </p>
                            </div>
                            <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
