import { useState } from "react";
import {
  FaBoxes,
  FaClipboardList,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import background from "../components/image/1.png";
import { motion, AnimatePresence } from "framer-motion";

function StaffDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleNav = () => setIsNavOpen((prev) => !prev);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out");
    setIsModalOpen(false);
    navigate("/");
  };

  // Variants untuk animasi kartu konten
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Variants untuk animasi modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay untuk membantu keterbacaan */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      {/* Navbar / Header */}
      <motion.header
        className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <FaUserCircle size={40} className="text-white" />
            <span className="text-2xl font-bold text-white">
              Staff Dashboard
            </span>
          </div>
          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-white text-sm">
              Selamat Datang, <strong>Staff!</strong>
            </span>
            <button
              className="px-5 py-2 bg-white text-indigo-600 font-medium rounded-lg shadow hover:bg-gray-100 transition"
              onClick={toggleModal}
            >
              Logout
            </button>
          </nav>
          {/* Hamburger Menu untuk Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleNav}
              className="text-white focus:outline-none"
            >
              {isNavOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        {/* Dropdown Navigasi Mobile */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.nav
              className="md:hidden bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4 flex flex-col gap-4">
                <span className="text-white text-sm">
                  Selamat Datang, <strong>Staff!</strong>
                </span>
                <button
                  className="w-full px-5 py-2 bg-white text-indigo-600 font-medium rounded-lg shadow hover:bg-gray-100 transition"
                  onClick={() => {
                    toggleModal();
                    setIsNavOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Konten Utama */}
      <main className="relative z-20 container mx-auto p-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-12 justify-center"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.2 }}
        >
          {/* Kartu: Pendataan Barang */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            className="bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <FaClipboardList className="text-green-500 text-4xl" />
              <h2 className="text-xl font-semibold text-gray-800">
                Pendataan Barang
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Kelola data barang dengan efisiensi tinggi.
            </p>
            <Link to="/DataManagement">
              <button className="mt-6 w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
                Kelola
              </button>
            </Link>
          </motion.div>

          {/* Kartu: Stok Barang */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            className="bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <FaBoxes className="text-yellow-500 text-4xl" />
              <h2 className="text-xl font-semibold text-gray-800">
                Stok Barang
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Pantau stok barang secara real-time.
            </p>
            <Link to="/StockManagement">
              <button className="mt-6 w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition">
                Lihat
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Modal Logout */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Konfirmasi Logout
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Apakah Anda yakin ingin keluar dari akun Staff? Pastikan semua
                data telah disimpan.
              </p>
              <div className="flex justify-around">
                <button
                  className="px-5 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition"
                  onClick={toggleModal}
                >
                  Batal
                </button>
                <button
                  className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default StaffDashboard;
