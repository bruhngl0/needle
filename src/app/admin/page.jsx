"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admindashboard.scss";

const AdminDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'orders'
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Dresses",
    image: "model1.png",
    sizes: "S,M,L,XL",
    stock: "10",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAdminData = async () => {
    setLoadingData(true);
    setError("");
    try {
      // Fetch Products
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Fetch Orders
      const orderRes = await fetch("/api/orders/admin/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const orderData = await orderRes.json();
      setOrders(orderData);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError("Failed to sync backend logs. Check connection to the API server.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== "admin") {
        router.push("/");
        return;
      }
      setTimeout(() => {
        fetchAdminData();
      }, 0);
    }
  }, [token, authLoading, user, router]);

  // Add Product Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const { name, description, price, category, image, sizes, stock } = productForm;

    if (!name || !description || !price || !category || !image) {
      setError("Please complete all product specifications.");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          category,
          image,
          sizes,
          stock: Number(stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to catalog product");
      }

      setSuccessMsg(`Successfully cataloged design "${data.name}"!`);
      setShowAddForm(false);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "Dresses",
        image: "model1.png",
        sizes: "S,M,L,XL",
        stock: "10",
      });
      // Refresh products list
      fetchAdminData();
    } catch (err) {
      console.error("Add product error:", err);
      setError(err.message || "Something went wrong cataloging product.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently retire the "${name}" design?`)) {
      return;
    }

    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to retire product");
      }

      setSuccessMsg(`Retired design "${name}" from catalog.`);
      fetchAdminData();
    } catch (err) {
      console.error("Delete product error:", err);
      setError(err.message || "Failed to remove product from catalog.");
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/orders/admin/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setSuccessMsg(`Order #${orderId} status updated to ${newStatus}.`);
      fetchAdminData();
    } catch (err) {
      console.error("Order status update error:", err);
      setError(err.message || "Failed to update order status.");
    }
  };

  const handleFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  // Derived stats
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status !== "Cancelled") {
      return sum + order.total_price;
    }
    return sum;
  }, 0);

  if (authLoading || (token && loadingData && products.length === 0)) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Syncing administrator panel data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-container">
        <div className="admin-header-row">
          <h1 className="admin-title">Administration Console</h1>
          <button onClick={fetchAdminData} className="refresh-logs-btn">
            🔄 Refresh Registry
          </button>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}
        {successMsg && <div className="admin-success-banner">{successMsg}</div>}

        {/* Analytics Widgets */}
        <div className="analytics-widgets-row">
          <div className="analytics-widget">
            <span className="widget-icon">💰</span>
            <div className="widget-data">
              <span className="widget-label">Total Volume</span>
              <span className="widget-value">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          <div className="analytics-widget">
            <span className="widget-icon">📜</span>
            <div className="widget-data">
              <span className="widget-label">Sales Count</span>
              <span className="widget-value">{orders.length} Orders</span>
            </div>
          </div>

          <div className="analytics-widget">
            <span className="widget-icon">🧵</span>
            <div className="widget-data">
              <span className="widget-label">Active Catalog</span>
              <span className="widget-value">{products.length} Designs</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="tabs-row">
          <button
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "tab-btn active" : "tab-btn"}
          >
            Catalog Registry
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
          >
            Customer Orders Ledger
          </button>
        </div>

        {/* Products Management Tab */}
        {activeTab === "products" && (
          <div className="admin-tab-content">
            <div className="catalog-actions-bar">
              <h3>Design Archive</h3>
              <button onClick={() => setShowAddForm(!showAddForm)} className="add-design-btn">
                {showAddForm ? "✕ Hide Draft Panel" : "＋ Register New Design"}
              </button>
            </div>

            {/* Add Product Inline Form */}
            {showAddForm && (
              <form onSubmit={handleProductSubmit} className="add-product-form">
                <h4 className="form-legend">New Product Specifications</h4>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Design Name</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Ruby Crimson Blazer"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Retail Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleFormChange}
                      placeholder="e.g. 195.00"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fabric & Cut Description</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleFormChange}
                    placeholder="Enter structural details, textile composition, and silhouette styling..."
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={productForm.category} onChange={handleFormChange}>
                      <option value="Dresses">Dresses</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Knitwear">Knitwear</option>
                      <option value="Tops">Tops</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Asset Filename</label>
                    <select name="image" value={productForm.image} onChange={handleFormChange}>
                      <option value="model1.png">model1.png (Red Gown)</option>
                      <option value="model2.png">model2.png (Tailored Blazer)</option>
                      <option value="model3.png">model3.png (Linen Coat)</option>
                      <option value="model4.png">model4.png (Trench Coat)</option>
                      <option value="model5.png">model5.png (Knitwear Set)</option>
                      <option value="model6.png">model6.png (Casual Top)</option>
                      <option value="model7.png">model7.png (Structured Dress)</option>
                      <option value="model8.png">model8.png (Velvet Pantsuit)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Initial Stock (Units)</label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleFormChange}
                      placeholder="10"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Size Run (comma separated)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={productForm.sizes}
                    onChange={handleFormChange}
                    placeholder="S,M,L,XL"
                    required
                  />
                </div>

                <button type="submit" className="submit-product-btn">
                  Publish to Active Shop Catalog
                </button>
              </form>
            )}

            {/* Products Table */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sizes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img src={`/${p.image}`} alt={p.name} className="table-thumbnail" />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.category}</td>
                      <td className="price-td">${p.price.toFixed(2)}</td>
                      <td>{p.stock} units</td>
                      <td>
                        <span className="sizes-block">{p.sizes}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="table-action-btn delete"
                        >
                          Retire Design
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Management Tab */}
        {activeTab === "orders" && (
          <div className="admin-tab-content">
            <h3>Customer Orders Registry</h3>

            {orders.length === 0 ? (
              <div className="admin-empty-state">No customer checkout transactions recorded.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table orders-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Customer Details</th>
                      <th>Items Description</th>
                      <th>Sub Total</th>
                      <th>Delivery Location</th>
                      <th>Status Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong>#NDL-{o.id}</strong>
                        </td>
                        <td>
                          <div className="user-td-cell">
                            <span className="u-name">{o.user_name}</span>
                            <span className="u-email">{o.user_email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="items-list-td">
                            {o.items.map((item) => (
                              <div key={`${item.id}-${item.size}`} className="item-mini-line">
                                • {item.product_name} ({item.size}) × {item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="price-td">${o.total_price.toFixed(2)}</td>
                        <td>
                          <div className="address-td-cell">
                            <span className="ship-recipient">{o.shipping_name}</span>
                            <span className="ship-loc">
                              {o.shipping_address}, {o.shipping_city} {o.shipping_zip}
                            </span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className={`status-select ${o.status.toLowerCase()}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
