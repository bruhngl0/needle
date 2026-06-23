"use client";

import React, { useState } from "react";
import "../styles/search.scss";
const Search = ({
  placeholder = "Search...",
  onSearch,
  onChange,
  value,
  className = "",
}) => {
  const [searchValue, setSearchValue] = useState(value || "");

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <div className={`search-container ${className}`}>
      <input
        type="text"
        className="search-bar"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        autoComplete="off"
      />
    </div>
  );
};

export default Search;
