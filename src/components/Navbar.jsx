"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Logo from "./Logo";
import "../styles/navbar.scss";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchVal, setSearchVal] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  };

  return (
    <nav className="global-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link href="/" className="nav-brand">
          <Logo width="80px" height="auto" />
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/shop" className="nav-link">Shop</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="nav-link admin-tag">Admin Panel</Link>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">🔍</button>
        </form>

        {/* Widget Icons */}
        <div className="nav-widgets">
          {/* Cart Icon with badge */}
          <Link href="/cart" className="nav-widget-btn cart-btn">
            <img src="/iconcart.png" alt="Cart" className="nav-icon-img" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth/Profile Icon */}
          {user ? (
            <div className="profile-dropdown-container">
              <Link href="/profile" className="nav-widget-btn">
                <img src="/iconuser.png" alt="User Profile" className="nav-icon-img" />
              </Link>
              <div className="profile-dropdown">
                <p className="welcome-msg">Hello, {user.name.split(" ")[0]}!</p>
                <Link href="/profile" className="dropdown-item">Order History</Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="dropdown-item">Admin Board</Link>
                )}
                <button onClick={logout} className="dropdown-item logout-btn">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="nav-widget-btn">
              <img src="/iconuser.png" alt="Login" className="nav-icon-img" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
