import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserTag, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Komponen Modal Konfirmasi untuk aksi hapus
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrasiPetugas = () => {
  const navigate = useNavigate();
  const [petugas, setPetugas] = useState([]);
  const [form, setForm] = useState({
    UserName: "",
    Email: "",
    Password: "",
    Role: "staff",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Menggunakan RegistrasiID untuk mengidentifikasi data yang akan dihapus
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    RegistrasiID: null,
  });

  // Mengambil data petugas menggunakan API GET saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        const response = await axios.get(
          "https://backend-kasir-production.up.railway.app/registrasi/"
        );
        // Asumsi respons API mengembalikan data di response.data.data
        setPetugas(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data petugas.");
      }
    };

    fetchPetugas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.UserName || !form.Email || !form.Password) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
      setError("Format email tidak valid!");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("UserName", form.UserName);
    formData.append("Email", form.Email);
    formData.append("Password", form.Password);
    formData.append("Role", form.Role);

    try {
      const response = await axios.post(
        "https://backend-kasir-production.up.railway.app/registrasi/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newPetugas = response.data.data;
      console.log("dataPetugas: ", newPetugas);
      setPetugas([...petugas, newPetugas]);
      setForm({ UserName: "", Email: "", Password: "", Role: "staff" });
    } catch (err) {
      setError("Gagal menambahkan petugas. Coba lagi nanti.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memunculkan modal hapus dengan RegistrasiID
  const handleDelete = (RegistrasiID) => {
    setDeleteModal({
      show: true,
      RegistrasiID,
    });
  };

  // Menggunakan RegistrasiID pada URL DELETE
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `https://backend-kasir-production.up.railway.app/registrasi/${deleteModal.RegistrasiID}`
      );
      const filteredPetugas = petugas.filter(
        (p) => p.RegistrasiID !== deleteModal.RegistrasiID
      );
      setPetugas(filteredPetugas);
    } catch (error) {
      console.error("Error deleting:", error);
      setError("Gagal menghapus petugas. Coba lagi nanti.");
    } finally {
      setDeleteModal({ show: false, RegistrasiID: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, RegistrasiID: null });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-gray-100"
    >
      {/* Tombol kembali */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition duration-300 z-50"
      >
        <FaArrowLeft className="mr-2" /> Kembali
      </button>

      <div className="w-full max-w-4xl space-y-8">
        {/* Card Registrasi */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-2xl rounded-xl p-8"
        >
          <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">
            Registrasi Petugas
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400">
                <div className="bg-blue-100 p-3">
                  <FaUserTag className="text-blue-500" />
                </div>
                <input
                  type="text"
                  name="UserName"
                  value={form.UserName}
                  onChange={handleInputChange}
                  placeholder="Masukkan username"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400">
                <div className="bg-blue-100 p-3">
                  <FaUserTag className="text-blue-500" />
                </div>
                <input
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400">
                <div className="bg-blue-100 p-3">
                  <FaEye className="text-blue-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={form.Password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className="w-full p-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-gray-500 hover:text-gray-700 transition-all duration-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Pilihan Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400">
                <div className="bg-blue-100 p-3">
                  <FaUserTag className="text-blue-500" />
                </div>
                <select
                  name="Role"
                  value={form.Role}
                  onChange={handleInputChange}
                  className="w-full p-2 outline-none bg-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Pesan Error */}
            {error && (
              <p className="text-red-500 text-center text-sm transition-all duration-300">
                {error}
              </p>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-lg font-semibold text-white transition-all duration-300 shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              }`}
            >
              {loading ? "Memproses..." : "Tambahkan Petugas"}
            </button>
          </form>
        </motion.div>

        {/* Daftar Petugas */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white shadow-2xl rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Daftar Petugas
          </h2>
          {petugas.length === 0 ? (
            <p className="text-gray-500 text-center text-sm">
              Belum ada petugas yang terdaftar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">
                      Username
                    </th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">
                      Role
                    </th>
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {petugas.map((p) => (
                    <tr
                      key={p.RegistrasiID}
                      className="transition-all duration-300 hover:bg-gray-100 even:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-gray-800 border border-gray-300">
                        {p.UserName}
                      </td>
                      <td className="px-4 py-2 text-gray-800 border border-gray-300">
                        {p.Email}
                      </td>
                      <td className="px-4 py-2 text-gray-800 border border-gray-300">
                        {p.Role}
                      </td>
                      <td className="px-4 py-2 text-center border border-gray-300">
                        <button
                          onClick={() => handleDelete(p.RegistrasiID)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md font-medium hover:bg-red-600 transition-all duration-300 shadow"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModal.show && (
        <ConfirmationModal
          message="Anda yakin ingin menghapus petugas ini?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </motion.div>
  );
};

export default RegistrasiPetugas;
