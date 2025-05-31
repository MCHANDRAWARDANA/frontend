import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowLeft,
  FaPlus,
  FaFileExport,
  FaFileImport,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPrint,
} from "react-icons/fa";
import { jsPDF } from "jspdf";

const PendataanBarang = () => {
  // State untuk data produk; ambil dari localStorage jika ada
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("items");
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // State form dengan field sesuai backend; gunakan ProdukID sebagai identifier
  const [form, setForm] = useState({
    ProdukID: null,
    NamaProduk: "",
    kategoriID: "",
    Harga: "",
    Stok: "",
    Diskon: "",
    HargaModal: "",
    Foto: null,
  });

  // State untuk daftar kategori
  const [kategoriList, setKategoriList] = useState([]);

  // State lain
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortCriteria, setSortCriteria] = useState("NamaProduk");
  const [sortOrder, setSortOrder] = useState("asc");
  const [logs, setLogs] = useState([]);
  const itemsPerPage = 10;

  // Simpan data produk ke localStorage setiap kali items berubah
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  // Ambil data kategori dari API GET /kategori/
  useEffect(() => {
    axios
      .get("https://backend-kasir-production.up.railway.app/kategori/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setKategoriList(data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data kategori:", error);
      });
  }, []);

  // Ambil data produk dari API GET /produk/
  useEffect(() => {
    axios
      .get("https://backend-kasir-production.up.railway.app/produk/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setItems(data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data produk:", error);
      });
  }, []);

  // Handler perubahan input (selalu gunakan fallback agar input terkendali)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler perubahan file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, Foto: file }));
    }
  };

  // Reset form dan mode editing
  const resetForm = () => {
    setForm({
      ProdukID: null,
      NamaProduk: "",
      kategoriID: "",
      Harga: "",
      Stok: "",
      Diskon: "",
      HargaModal: "",
      Foto: null,
    });
    setIsEditing(false);
  };

  // Tambah produk baru
  const handleAddItem = async () => {
    if (
      form.NamaProduk &&
      form.kategoriID &&
      parseFloat(form.Harga) > 0 &&
      parseInt(form.Stok) > 0
    ) {
      const formData = new FormData();
      // Gunakan nama field sesuai dengan model backend
      formData.append("NamaProduk", form.NamaProduk);
      formData.append("kategoriID", form.kategoriID);
      formData.append("Harga", parseFloat(form.Harga));
      formData.append("Stok", parseInt(form.Stok));
      formData.append("Diskon", parseFloat(form.Diskon));
      formData.append("HargaModal", parseFloat(form.HargaModal));
      if (form.Foto) {
        formData.append("Foto", form.Foto);
      }

      try {
        const response = await axios.post(
          "https://backend-kasir-production.up.railway.app/produk/",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        // Misalkan response.data mengandung produk baru dengan ProdukID
        setItems([...items, response.data]);
        setCurrentPage(1);
        resetForm();
      } catch (error) {
        console.error("Gagal menambahkan produk:", error);
      }
    } else {
      alert("Harap isi semua field dengan benar, termasuk kategori.");
    }
  };

  // Set form untuk mengedit produk dengan fallback nilai agar input terkendali
  const handleEditItem = (item) => {
    setForm({
      ProdukID: item.ProdukID,
      NamaProduk: item.NamaProduk || "",
      kategoriID: item.kategoriID || "",
      Harga: item.Harga || "",
      Stok: item.Stok || "",
      Diskon: item.Diskon || "",
      HargaModal: item.HargaModal || "",
      Foto: item.Foto || null,
    });
    setIsEditing(true);
  };

  // Update produk menggunakan ProdukID (tanpa AccessToken)
  const handleUpdateItem = async () => {
    if (!form.ProdukID) return;

    try {
      // 1) Kalau ada file baru, pakai FormData + multipart header
      if (form.Foto instanceof File) {
        const formData = new FormData();
        formData.append("NamaProduk", form.NamaProduk);
        formData.append("kategoriID", form.kategoriID);
        formData.append("Harga", Number(form.Harga));
        formData.append("Stok", Number(form.Stok));
        formData.append("Diskon", Number(form.Diskon));
        formData.append("HargaModal", Number(form.HargaModal));
        formData.append("Foto", form.Foto);
        await axios.put(
          `https://backend-kasir-production.up.railway.app/produk/${form.ProdukID}/`, // tambahkan trailing slash jika perlu
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      // 2) Kalau tidak ada file, kirim JSON biasa
      else {
        await axios.put(
          `https://backend-kasir-production.up.railway.app/produk/${form.ProdukID}`,
          {
            NamaProduk: form.NamaProduk,
            kategoriID: form.kategoriID,
            Harga: Number(form.Harga),
            Stok: Number(form.Stok),
            Diskon: Number(form.Diskon),
            HargaModal: Number(form.HargaModal),
          }
        );
      }

      const res = await axios.get(
        "https://backend-kasir-production.up.railway.app/produk/"
      );
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setItems(data);
      resetForm();
    } catch (err) {
      console.error("Gagal mengupdate produk:", err.response?.data || err);
      alert(
        "Gagal mengupdate produk: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Tampilkan modal hapus dengan ProdukID
  const handleDeleteItem = (ProdukID) => {
    setShowDeleteModal(true);
    setItemToDelete(ProdukID);
  };

  // Konfirmasi hapus produk menggunakan ProdukID
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(
        `https://backend-kasir-production.up.railway.app/produk/${itemToDelete}`
      );
      setItems(items.filter((item) => item.ProdukID !== itemToDelete));
      setLogs((prevLogs) => [
        ...prevLogs,
        `Deleted item with ProdukID ${itemToDelete} on ${new Date().toLocaleString()}`,
      ]);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      alert("Gagal menghapus produk. Silakan periksa log server untuk detail.");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Handler pencarian, filter, dan sorting
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const sortedItems = items
    .filter((item) => {
      const namaProduk = item.NamaProduk || "";
      const matchesSearch = namaProduk
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? String(item.kategoriID) === String(selectedCategory)
        : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortCriteria === "Harga") {
        return sortOrder === "asc"
          ? parseFloat(a.Harga) - parseFloat(b.Harga)
          : parseFloat(b.Harga) - parseFloat(a.Harga);
      } else if (sortCriteria === "Stok") {
        return sortOrder === "asc"
          ? parseInt(a.Stok) - parseInt(b.Stok)
          : parseInt(b.Stok) - parseInt(a.Stok);
      } else if (sortCriteria === "NamaProduk") {
        const namaA = (a.NamaProduk || "").toLowerCase();
        const namaB = (b.NamaProduk || "").toLowerCase();
        if (namaA < namaB) return sortOrder === "asc" ? -1 : 1;
        if (namaA > namaB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      } else {
        return 0;
      }
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Helper untuk status stok
  const getStockStatus = (Stok) => {
    const stokNum = parseInt(Stok);
    if (stokNum === 0) return <span className="text-red-500">Stok Habis</span>;
    if (stokNum <= 10)
      return <span className="text-yellow-500">Hampir Habis</span>;
    return <span className="text-green-500">Tersedia</span>;
  };

  // Hitung harga setelah diskon
  const calculateDiscountedPrice = (Harga, Diskon) => {
    return Harga - (Harga * Diskon) / 100;
  };

  // Hitung keuntungan
  const calculateProfit = (Harga, HargaModal, Diskon) => {
    const finalPrice = Harga - (Harga * Diskon) / 100;
    return finalPrice - HargaModal;
  };

  // Export ke CSV
  const exportToCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      items
        .map((item) =>
          [
            item.NamaProduk,
            item.kategoriID,
            item.Harga,
            item.HargaModal,
            item.Stok,
            item.Diskon,
          ].join(",")
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_barang.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Export ke PDF menggunakan jsPDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Data Barang", 10, 20);
    doc.setFontSize(12);
    let y = 30;
    items.forEach((item, index) => {
      const line = `${index + 1}. ${item.NamaProduk} | ${
        item.kategoriID
      } | Harga: ${item.Harga} | Harga Modal: ${item.HargaModal} | Stok: ${
        item.Stok
      }`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("data_barang.pdf");
  };

  // Import data dari CSV
  const importFromCSV = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n");
      const newItems = rows.map((row) => {
        const [NamaProduk, kategoriID, Harga, HargaModal, Stok, Diskon] =
          row.split(",");
        return {
          ProdukID: Date.now() + Math.random(),
          NamaProduk: NamaProduk || "",
          kategoriID: kategoriID || "",
          Harga: parseFloat(Harga) || 0,
          HargaModal: parseFloat(HargaModal) || 0,
          Stok: parseInt(Stok) || 0,
          Diskon: parseFloat(Diskon) || 0,
          Foto: null,
        };
      });
      setItems(newItems);
    };
    reader.readAsText(file);
  };

  // Cetak label harga
  const printLabel = (item) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Label Harga - ${item.NamaProduk}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .label { border: 1px solid #000; padding: 10px; width: 250px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="label">
            <h3>${item.NamaProduk}</h3>
            <p>Harga: ${parseFloat(item.Harga).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}</p>
            <p>Harga Modal: ${parseFloat(item.HargaModal).toLocaleString(
              "id-ID",
              {
                style: "currency",
                currency: "IDR",
              }
            )}</p>
            <p>Keuntungan: Rp ${calculateProfit(
              item.Harga,
              item.HargaModal,
              item.Diskon
            )}</p>
            <p>Diskon: ${item.Diskon}%</p>
            <p>Stok: ${item.Stok} Produk</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-200">
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition duration-300 z-50"
      >
        <FaArrowLeft className="mr-2" /> Kembali
      </button>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-4 mb-4 relative shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Manajemen Inventori Barang</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        {/* Tombol Aksi */}
        <div className="flex flex-wrap justify-end gap-4 mb-6">
          <button
            onClick={exportToCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center transition duration-300"
          >
            <FaFileExport className="mr-2" /> Export ke CSV
          </button>
          <label className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center cursor-pointer transition duration-300">
            <FaFileImport className="mr-2" /> Import dari CSV
            <input
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={exportToPDF}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center transition duration-300"
          >
            <FaFileExport className="mr-2" /> Export ke PDF
          </button>
        </div>

        {/* Pencarian, Filter, dan Sort */}
        <div className="flex flex-wrap items-center mb-6 gap-2 w-full">
          <div className="relative w-full md:w-1/4 flex items-center border border-gray-300 p-3 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Cari Barang..."
              value={searchTerm}
              onChange={(e) => handleSearch(e)}
              className="w-full focus:outline-none"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <select
              value={selectedCategory}
              onChange={handleCategoryFilter}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((kategori) => (
                <option key={kategori.kategoriID} value={kategori.kategoriID}>
                  {kategori.namaKategori}
                </option>
              ))}
            </select>
            <select
              value={sortCriteria}
              onChange={handleSortChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NamaProduk">Nama Produk</option>
              <option value="Harga">Harga</option>
              <option value="Stok">Stok</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center transition duration-300"
            >
              {sortOrder === "asc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </button>
          </div>
        </div>

        {/* Form Input Barang */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="NamaProduk"
              className="mb-1 text-gray-700 font-bold"
            >
              Nama Produk
            </label>
            <input
              type="text"
              id="NamaProduk"
              name="NamaProduk"
              placeholder="Masukan Nama Produk"
              value={form.NamaProduk || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="kategoriID"
              className="mb-1 text-gray-700 font-bold"
            >
              Kategori
            </label>
            <select
              id="kategoriID"
              name="kategoriID"
              value={form.kategoriID || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              <option value="">Pilih Kategori</option>
              {kategoriList.map((kategori) => (
                <option key={kategori.kategoriID} value={kategori.kategoriID}>
                  {kategori.namaKategori}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="Harga" className="mb-1 text-gray-700 font-bold">
              Harga (Rp)
            </label>
            <input
              type="number"
              id="Harga"
              name="Harga"
              placeholder="Masukan Harga (Rp)"
              value={form.Harga || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="HargaModal"
              className="mb-1 text-gray-700 font-bold"
            >
              Harga Modal (Rp)
            </label>
            <input
              type="number"
              id="HargaModal"
              name="HargaModal"
              placeholder="Masukan Harga Modal (Rp)"
              value={form.HargaModal || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="Stok" className="mb-1 text-gray-700 font-bold">
              Stok
            </label>
            <input
              type="number"
              id="Stok"
              name="Stok"
              placeholder="Masukan Stok"
              value={form.Stok || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="Diskon" className="mb-1 text-gray-700 font-bold">
              Diskon (%)
            </label>
            <input
              type="number"
              id="Diskon"
              name="Diskon"
              placeholder="Masukan Diskon (%)"
              value={form.Diskon || ""}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="gambar" className="mb-1 text-gray-700 font-bold">
              Gambar Produk
            </label>
            <input
              type="file"
              id="gambar"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          {/* Tombol aksi form */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-bold invisible">
              Button
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateItem}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center transition duration-300"
                >
                  <FaEdit className="mr-2" /> Update
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center transition duration-300"
                >
                  Batalkan
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddItem}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full flex items-center justify-center transition duration-300"
              >
                <FaPlus className="mr-2" /> Tambah
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Barang */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal border-b border-gray-300">
              <tr>
                {[
                  "Nama Produk",
                  "Kategori",
                  "Harga",
                  "Harga Modal",
                  "Diskon",
                  "Harga Setelah Diskon",
                  "Keuntungan",
                  "Stok",
                  "Foto",
                  "Aksi",
                ].map((header, index) => (
                  <th
                    key={index}
                    className={`p-4 text-center border-r border-gray-300 ${
                      header === "Foto" || header === "Aksi" ? "w-48" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {currentItems.map((item, index) => (
                <tr
                  key={`${item.ProdukID}-${index}`}
                  className="hover:bg-gray-50 transition duration-300 border-b border-gray-300"
                >
                  <td className="p-4 border-r border-gray-300">
                    {item.NamaProduk}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {kategoriList.find(
                      (kategori) =>
                        String(kategori.kategoriID) === String(item.kategoriID)
                    )?.namaKategori || item.kategoriID}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {parseFloat(item.Harga).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {parseFloat(item.HargaModal).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {item.Diskon}%
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {calculateDiscountedPrice(
                      item.Harga,
                      item.Diskon
                    ).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {calculateProfit(
                      item.Harga,
                      item.HargaModal,
                      item.Diskon
                    ).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="p-4 border-r border-gray-300">
                    {item.Stok} ({getStockStatus(item.Stok)})
                  </td>
                  <td className="p-1 border-r border-gray-300">
                    {item.Foto && (
                      <img
                        src={`http://localhost:5000/uploads/${item.Foto}`}
                        alt={item.NamaProduk}
                        className="w-40 h-24 object-cover rounded-md"
                      />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-500 hover:text-blue-600 mr-3 transition duration-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.ProdukID)}
                      className="text-red-500 hover:text-red-600 mr-3 transition duration-300"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => printLabel(item)}
                      className="text-green-500 hover:text-green-600 mr-3 transition duration-300"
                    >
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition duration-300"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition duration-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Konfirmasi Penghapusan</h2>
            <p className="mb-4">
              Apakah Anda yakin ingin menghapus barang ini?
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition duration-300"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteItem}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendataanBarang;
