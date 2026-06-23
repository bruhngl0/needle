"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import "../../../styles/productdetails.scss";

const ProductDetails = ({ id: propId }) => {
  const params = useParams();
  const id = propId || params?.id;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [addedText, setAddedText] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error("Product details not found");
        }
        const data = await res.json();
        setProduct(data);
        // Default size to the first available size
        if (data.sizes) {
          const sizesArray = data.sizes.split(",");
          if (sizesArray.length > 0) {
            setSelectedSize(sizesArray[0]);
          }
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        setError("Unable to retrieve details for this design.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, quantity);
    setAddedText(true);
    setTimeout(() => {
      setAddedText(false);
    }, 2000);
  };

  const handleQtyChange = (val) => {
    const num = Number(val);
    if (num >= 1 && num <= (product?.stock || 10)) {
      setQuantity(num);
    }
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="spinner"></div>
        <p>Retrieving design specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <h3>Design Not Found</h3>
        <p>{error || "This specific product is no longer in our active collections."}</p>
        <Link href="/shop" className="back-to-shop-btn">
          Return To Shop
        </Link>
      </div>
    );
  }

  const sizesList = product.sizes ? product.sizes.split(",") : ["S", "M", "L", "XL"];

  return (
    <div className="product-details-page">
      <div className="details-container">
        {/* Navigation Breadcrumb */}
        <div className="details-breadcrumb">
          <Link href="/">Home</Link> &gt; <Link href="/shop">Shop</Link> &gt; <span>{product.name}</span>
        </div>

        <div className="details-grid">
          {/* Left Column: Product Image */}
          <div className="details-image-section">
            <img src={"/" + product.image.replace(/^\//, "")} alt={product.name} className="details-img" />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="details-info-section">
            <span className="info-category">{product.category}</span>
            <h1 className="info-title">{product.name}</h1>
            <p className="info-price">${product.price.toFixed(2)}</p>

            <div className="divider"></div>

            <p className="info-description">{product.description}</p>

            <div className="divider"></div>

            {/* Size Selector */}
            <div className="selector-group">
              <label className="selector-label">Select Size</label>
              <div className="sizes-options">
                {sizesList.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "size-btn active" : "size-btn"}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="selector-group">
              <label className="selector-label">Quantity</label>
              <div className="qty-picker">
                <button
                  onClick={() => handleQtyChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  onClick={() => handleQtyChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="qty-btn"
                >
                  +
                </button>
                <span className="stock-info">({product.stock} items remaining)</span>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="action-row">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={addedText ? "add-to-cart-btn success" : "add-to-cart-btn"}
              >
                {product.stock <= 0
                  ? "Out of Stock"
                  : addedText
                  ? "Added to Cart ✓"
                  : "Add To Shopping Bag"}
              </button>
            </div>

            <div className="guarantees">
              <div className="guarantee-item">
                <span className="guarantee-icon">📦</span>
                <span>Free priority shipping on orders over $150</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">🧵</span>
                <span>Handcrafted tailored fits with premium materials</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
