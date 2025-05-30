// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

// Contoh sederhana: periksa apakah token ada di localStorage
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // atau ambil dari context/redux

  // Jika tidak ada token, redirect ke halaman login
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;
