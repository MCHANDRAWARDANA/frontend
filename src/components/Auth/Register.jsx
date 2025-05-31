import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import axios from "axios";
import ChandraImg from "..//image/me.jpeg";

// Data testimonial
const testimonials = [
  {
    UserName: "MOH.CHANDRA WARDANA",
    role: "Pemilik Toko",
    message:
      "Sistem kasir ini sangat membantu dalam mengelola Produk penjualan. Proses pembayaran jadi lebih cepat dan akurat.",
    image: ChandraImg,
  },
  {
    UserName: "FIRMAN MAULANA PRATAMA",
    role: "Manajer Toko",
    message:
      "Dengan sistem kasir ini, laporan penjualan menjadi mudah dipantau. Saya sangat merekomendasikannya untuk bisnis retail.",
    image: ChandraImg,
  },
];

// Variants animasi testimonial
const testimonialVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 1.0 } },
  exit: { opacity: 0, x: -50, transition: { duration: 1.0 } },
};

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-48">
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={currentSlide}
          variants={testimonialVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute flex flex-col items-center text-center px-4"
        >
          <img
            src={testimonials[currentSlide].image}
            alt={testimonials[currentSlide].UserName}
            className="w-16 h-16 rounded-full mb-4 border-2 border-gray-300 dark:border-gray-500"
          />
          <p className="text-xl text-gray-700 italic mb-2 dark:text-gray-300">
            “{testimonials[currentSlide].message}”
          </p>
          <p className="text-md text-gray-900 font-semibold dark:text-gray-100">
            – {testimonials[currentSlide].UserName},{" "}
            <span className="font-normal">
              {testimonials[currentSlide].role}
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const RegisterForm = () => {
  const navigate = useNavigate();

  // State dengan penamaan konsisten
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!UserName || !Email || !Password) {
      setError("All fields are required!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { UserName, Email, Password };
      const response = await axios.post(
        "https://backend-kasir-production.up.railway.app/pelanggan/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Registration successful:", response.data);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-md border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg bg-white dark:bg-gray-800">
      <motion.h2
        className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center"
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Get Started
      </motion.h2>
      {error && (
        <motion.div
          className="mb-4 text-red-500 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <IoPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="UserName"
              value={UserName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
                error && !UserName ? "border-red-500" : "border-gray-300"
              }`}
              aria-label="Full Name"
            />
          </div>
        </div>
        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
                error && !Email ? "border-red-500" : "border-gray-300"
              }`}
              aria-label="Email"
            />
          </div>
        </div>
        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password Anda"
              className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
                error && !Password ? "border-red-500" : "border-gray-300"
              }`}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
          </div>
          {/* Indikator kekuatan password */}
          {Password && (
            <motion.p
              className="mt-1 text-sm text-green-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Strong!
            </motion.p>
          )}
        </div>
        {/* Tombol Sign Up */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 mb-4 flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Signing Up...
            </>
          ) : (
            "Sign Up"
          )}
        </motion.button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300">
        Sudah mempunyai akun?{" "}
        <Link to="/" className="text-blue-500 hover:underline font-semibold">
          Login sekarang
        </Link>
      </p>
    </div>
  );
};

const Register = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Bagian Kiri: Informasi & Testimonial */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex flex-col justify-center p-10">
        <div className="max-w-lg mx-auto">
          <motion.h1
            className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Sistem Kasir Terbaik untuk Bisnis Anda
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Kelola barang dan laporan penjualan dengan mudah. Nikmati kemudahan,
            kecepatan, dan keamanan dalam setiap pengelolaan Barang.
          </motion.p>
          <TestimonialSlider />
        </div>
      </div>
      {/* Bagian Kanan: Formulir Pendaftaran */}
      <div className="md:w-1/2 flex items-center justify-center p-10 bg-white dark:bg-gray-900">
        <RegisterForm />
      </div>
    </motion.div>
  );
};

export default Register;
