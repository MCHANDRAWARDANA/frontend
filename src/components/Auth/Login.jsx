import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import background from "../image/back.png";

const flipVariants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: { type: "spring", stiffness: 80, damping: 20, duration: 1.5 },
  },
  exit: {
    opacity: 0,
    rotateY: 90,
    transition: { duration: 1.2 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5 },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil email dari state yang dikirim dari halaman register (jika ada)
  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    Email: initialEmail,
    Password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Tangani perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fungsi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.Email || !formData.Password) {
      setError("Email dan password wajib diisi!");
      return;
    }

    try {
      // Lakukan POST ke API login
      const response = await axios.post(
        "https://backend-kasir-production.up.railway.app/auth/login",
        {
          Email: formData.Email,
          Password: formData.Password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Logging respons API untuk debugging
      console.log("Response data:", response.data.data);

      const { token, Role } = response.data.data;

      // Pastikan properti Role ada sebelum digunakan
      if (!Role) {
        setError("Respons tidak mengandung Role. Mohon periksa API login.");
        return;
      }

      // Simpan token ke localStorage
      localStorage.setItem("AccessToken", token);
      if (Role === "Admin") {
        navigate("/AdminDashboard");
      } else if (Role === "Staff") {
        navigate("/StaffDashboard");
      } else {
        setError("Role tidak valid!");
      }
    } catch (err) {
      console.error(err);
      setError("Email atau password salah!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8"
        style={{ perspective: 1000 }}
        variants={flipVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.h2
          className="text-4xl font-bold text-center text-gray-800 mb-6"
          variants={childVariants}
        >
          Selamat Datang
        </motion.h2>
        {error && (
          <motion.div
            className="mb-4 text-red-500 text-center bg-red-100 py-2 rounded-lg"
            variants={childVariants}
          >
            {error}
          </motion.div>
        )}
        <motion.form onSubmit={handleSubmit} variants={childVariants}>
          <motion.div className="mb-6" variants={childVariants}>
            <label
              htmlFor="Email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <motion.input
                type="email"
                name="Email"
                id="Email"
                value={formData.Email}
                onChange={handleInputChange}
                className="w-full p-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan email Anda"
                whileFocus={{ scale: 1.05 }}
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>

          <motion.div className="mb-6" variants={childVariants}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <motion.input
                type={showPassword ? "text" : "password"}
                name="Password"
                id="password"
                value={formData.Password}
                onChange={handleInputChange}
                className="w-full p-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan password Anda"
                whileFocus={{ scale: 1.05 }}
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            variants={childVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
          <motion.div className="mt-4 text-center" variants={childVariants}>
            <p className="text-sm text-gray-600">
              Belum mempunyai akun?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Daftar
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
