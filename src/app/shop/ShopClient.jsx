"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import "../../styles/shop.scss";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "/api/products";
        const queryParams = [];

        if (activeCategory) {
          queryParams.push(`category=${encodeURIComponent(activeCategory)}`);
        }
        if (searchQuery) {
          queryParams.push(`q=${encodeURIComponent(searchQuery)}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Fetch shop error:", err);
        setError("Error loading product catalog. Make sure the API server is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, searchQuery]);

  const handleCategorySelect = (categoryName) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (categoryName) {
      newParams.set("category", categoryName);
    } else {
      newParams.delete("category");
    }
    router.push(`/shop?${newParams.toString()}`);
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("q");
    router.push(`/shop?${newParams.toString()}`);
  };

  const categories = ["Dresses", "Outerwear", "Knitwear", "Tops"];

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">Collections</h3>
            <ul className="category-list">
              <li
                className={!activeCategory ? "category-item active" : "category-item"}
                onClick={() => handleCategorySelect("")}
              >
                All Products
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? "category-item active" : "category-item"}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group info-box">
            <h3 className="filter-title">Tailoring Standards</h3>
            <p className="sidebar-info-text">
              Every item is created by hand in our workshop using traditional techniques, custom hardware, and premium fabrics.
            </p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="shop-main-content">
          <div className="shop-header">
            <div>
              <h2 className="shop-title">
                {activeCategory ? `${activeCategory}` : "All Collections"}
              </h2>
              <p className="shop-subtitle">{products.length} Items found</p>
            </div>

            {searchQuery && (
              <div className="active-search-indicator">
                Showing results for: <strong>&quot;{searchQuery}&quot;</strong>
                <button onClick={handleClearSearch} className="clear-search-btn">
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="shop-loader">
              <div className="spinner"></div>
              <p>Loading needle archive...</p>
            </div>
          ) : error ? (
            <div className="shop-error-message">
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="shop-no-results">
              <p>No products match your active selection.</p>
              <button
                onClick={() => {
                  router.push("/shop");
                }}
                className="reset-filters-btn"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="shop-product-card">
                  <Link href={`/product/${product.id}`} className="product-image-wrapper">
                    <img src={"/" + product.image.replace(/^\//, "")} alt={product.name} className="product-image" />
                    <div className="product-card-overlay">
                      <span className="overlay-action-btn">View Details</span>
                    </div>
                  </Link>
                  <div className="product-info">
                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      <span className="product-price">${product.price.toFixed(2)}</span>
                    </div>
                    <Link href={`/product/${product.id}`} className="product-title-link">
                      <h4 className="product-name">{product.name}</h4>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default function ShopPage() {
  return (
    <React.Suspense fallback={
      <div className="shop-loader">
        <div className="spinner"></div>
        <p>Loading needle archive...</p>
      </div>
    }>
      <Shop />
    </React.Suspense>
  );
}
