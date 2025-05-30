import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaFileExport,
  FaFileImport,
  FaTrash,
  FaPrint,
  FaSearch,
  FaEdit,
  FaArrowLeft,
  FaBook,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StockPage = () => {
  const navigate = useNavigate();

  // State data produk dan kategori
  const [items, setItems] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "" });
  const [logs, setLogs] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [sortOption, setSortOption] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data produk dari API
  useEffect(() => {
    axios
      .get("http://localhost:5000/produk/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setItems(data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data produk:", error);
      });
  }, []);

  // Fetch data kategori dari API
  useEffect(() => {
    axios
      .get("http://localhost:5000/kategori/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setKategoriList(data);
      })
      .catch((error) => {
        console.error("Gagal mengambil data kategori:", error);
      });
  }, []);

  // Hitung total barang dan nilai inventaris
  const totalItems = items.length;
  const totalInventoryValue = items.reduce(
    (acc, item) => acc + item.Harga * item.Stok,
    0
  );

  // Format Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Update stok tanpa menggunakan token
  const handleUpdateStock = (item, newStock) => {
    setItems((prevItems) =>
      prevItems.map((it) => {
        if (it.ProdukID === item.ProdukID) {
          const oldStock = it.Stok;
          setLogs((prevLogs) => [
            ...prevLogs,
            `Updated stock for "${
              it.NamaProduk
            }" from ${oldStock} to ${newStock} on ${new Date().toLocaleString()}`,
          ]);
          return {
            ...it,
            Stok: newStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return it;
      })
    );

    axios
      .put(`http://localhost:5000/produk/${item.ProdukID}`, {
        Stok: newStock,
        lastUpdated: new Date().toISOString(),
      })
      .then((res) => {
        console.log("Produk berhasil di-update:", res.data);
      })
      .catch((error) => {
        console.error("Gagal mengupdate produk:", error);
      });
  };

  // Hapus produk tanpa menggunakan token, menggunakan ProdukID secara langsung
  const handleDelete = async (ProdukID) => {
    try {
      // Kirim request DELETE ke endpoint /produk/:ProdukID
      await axios.delete(`http://localhost:5000/produk/${ProdukID}`);
      console.log("Produk berhasil dihapus:", ProdukID);
      // Update state: hapus item dengan ProdukID yang bersangkutan
      setItems((prevItems) =>
        prevItems.filter((item) => item.ProdukID !== ProdukID)
      );
      setLogs((prevLogs) => [
        ...prevLogs,
        `Deleted item with ProdukID ${ProdukID} on ${new Date().toLocaleString()}`,
      ]);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      alert("Gagal menghapus produk. Silakan periksa log server untuk detail.");
    } finally {
      setDeleteItem(null);
    }
  };

  const handlePrintItem = (item) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Detail Cetak Item</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Detail Produk</h2>
          <table>
            <tr>
              <th>Foto</th>
              <td>
                <img src="http://localhost:5000/uploads/${item.Foto}" alt="${
      item.NamaProduk
    }" style="width:100px;height:auto;" />
              </td>
            </tr>
            <tr>
              <th>Nama Produk</th>
              <td>${item.NamaProduk}</td>
            </tr>
            <tr>
              <th>Kategori</th>
              <td>${
                kategoriList.find(
                  (kategori) => kategori.kategoriID === item.kategoriID
                )?.namaKategori || item.kategoriID
              }</td>
            </tr>
            <tr>
              <th>Harga</th>
              <td>${formatRupiah(item.Harga)}</td>
            </tr>
            <tr>
              <th>Stok</th>
              <td>${item.Stok}</td>
            </tr>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.NamaProduk || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filters.category || item.kategoriID === filters.category;
    return matchesSearch && matchesCategory;
  });

  // Sorting data
  const sortedItems = sortOption
    ? [...filteredItems].sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return a.NamaProduk.localeCompare(b.NamaProduk);
          case "name-desc":
            return b.NamaProduk.localeCompare(a.NamaProduk);
          case "stock-asc":
            return a.Stok - b.Stok;
          case "stock-desc":
            return b.Stok - a.Stok;
          case "price-asc":
            return a.Harga - b.Harga;
          case "price-desc":
            return b.Harga - a.Harga;
          default:
            return 0;
        }
      })
    : [...filteredItems].sort(
        (a, b) =>
          new Date(b.lastUpdated || b.createdAt || 0) -
          new Date(a.lastUpdated || a.createdAt || 0)
      );

  // Pagination: data untuk halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Export CSV
  const handleExportCSV = () => {
    const csvHeader = "Foto,NamaProduk,kategoriID,Harga,Stok\n";
    const csvRows = sortedItems.map(
      (item) =>
        `"${item.Foto}","${item.NamaProduk}","${item.kategoriID}",${item.Harga},${item.Stok}`
    );
    const csvContent = csvHeader + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stok_barang.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Stok Barang", 14, 20);

    const tableColumn = ["Foto", "NamaProduk", "Kategori", "Harga", "Stok"];
    const tableRows = sortedItems.map((item) => [
      item.Foto,
      item.NamaProduk,
      kategoriList.find((kategori) => kategori.kategoriID === item.kategoriID)
        ?.namaKategori || item.kategoriID,
      formatRupiah(item.Harga),
      item.Stok,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("laporan_stok_barang.pdf");
  };

  // Import CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const dataLines = lines.slice(1);
      const importedItems = dataLines.map((line) => {
        const values = line.split(",");
        return {
          ProdukID: Date.now() + Math.random(),
          Foto: values[0].replace(/"/g, ""),
          NamaProduk: values[1].replace(/"/g, ""),
          kategoriID: values[2].replace(/"/g, ""),
          Harga: parseInt(values[3]),
          Stok: parseInt(values[4]),
          lastUpdated: new Date().toISOString(),
        };
      });
      setItems(importedItems);
      setCurrentPage(1);
    };
    reader.readAsText(file);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Modal Update Stok
  const UpdateStockModal = ({ item, onClose, handleUpdateStock }) => {
    const [stockChange, setStockChange] = useState("");
    const handleSubmit = () => {
      const updatedStock = parseInt(stockChange);
      if (!isNaN(updatedStock)) {
        handleUpdateStock(item, updatedStock);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Update Stok {item.NamaProduk}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Jumlah Stok Baru
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan jumlah"
              value={stockChange}
              onChange={(e) => setStockChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Riwayat Log
  const LogModal = ({ logs, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Riwayat Perubahan Stok</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-gray-600">Belum ada log perubahan.</p>
            ) : (
              logs.map((log, index) => (
                <p key={index} className="text-sm text-gray-800">
                  {log}
                </p>
              ))
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Konfirmasi Hapus Item
  const DeleteModal = ({ item, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Konfirmasi Hapus</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus item "{item.NamaProduk}"?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm(item.ProdukID);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Komponen Grafik Barang dengan Chart.js
  const ItemChart = ({ data }) => {
    const chartData = {
      labels: data.map((item) => item.NamaProduk),
      datasets: [
        {
          label: "Stok Barang",
          type: "bar",
          data: data.map((item) => item.Stok),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Harga Barang",
          type: "line",
          data: data.map((item) => item.Harga),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000 },
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 14 } },
        },
        title: {
          display: true,
          text: "Grafik Stok & Harga Barang",
          font: { size: 18 },
        },
      },
      layout: {
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 } } },
        y: {
          beginAtZero: true,
          position: "left",
          ticks: { font: { size: 12 } },
          title: { display: true, text: "Jumlah Stok", font: { size: 14 } },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 12 } },
          title: { display: true, text: "Harga (IDR)", font: { size: 14 } },
        },
      },
    };

    return (
      <div
        className="bg-white rounded-lg shadow-lg mt-8 p-4 max-w-4xl mx-auto"
        style={{ height: "400px" }}
      >
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Tombol Kembali */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        <FaArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Dashboard Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Barang
            </h3>
            <p className="text-3xl font-bold text-indigo-600">{totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Inventaris
            </h3>
            <p className="text-3xl font-bold text-green-600 break-words">
              {formatRupiah(totalInventoryValue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">Stok Rendah</h3>
            <p className="text-3xl font-bold text-red-600">
              {items.filter((item) => item.Stok < 10).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-700">
                Manajemen Stok Barang
              </h1>
              <p className="text-gray-600">
                Terakhir update: {new Date().toLocaleDateString()}
              </p>
            </div>
            {/* Menu Aksi */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4 md:mt-0 -mr-20">
              <button
                onClick={handleExportCSV}
                title="Export data ke CSV"
                className="flex flex-col items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow"
              >
                <FaFileExport className="w-6 h-6" />
                <span className="text-sm">Export CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                title="Export data ke PDF"
                className="flex flex-col items-center gap-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition shadow"
              >
                <FaFileExport className="w-6 h-6" />
                <span className="text-sm">Export PDF</span>
              </button>
              <label
                title="Import data dari file CSV"
                className="flex flex-col items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition shadow cursor-pointer"
              >
                <FaFileImport className="w-6 h-6" />
                <span className="text-sm">Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>
              <button
                onClick={handlePrintReport}
                title="Cetak laporan seluruh stok barang"
                className="flex flex-col items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition shadow"
              >
                <FaPrint className="w-6 h-6" />
                <span className="text-sm">Cetak</span>
              </button>
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute top-3 left-3 text-gray-500" />
              <input
                type="text"
                placeholder="Cari barang..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg w-full md:w-48 focus:ring-2 focus:ring-blue-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sortir Berdasarkan</option>
              <option value="stock-asc">Stok (Terkecil)</option>
              <option value="stock-desc">Stok (Terbanyak)</option>
              <option value="price-asc">Harga (Termurah)</option>
              <option value="price-desc">Harga (Termahal)</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
            </select>
          </div>

          {/* Tabel Data */}
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="table-fixed w-full text-sm text-gray-700 border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr className="border-b-2 border-gray-300">
                  <th className="w-24 px-4 py-3 text-center font-semibold text-gray-700">
                    Nama Produk
                  </th>
                  <th className="w-24 px-4 py-3 text-center font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-700">
                    Harga
                  </th>
                  <th className="w-16 px-4 py-3 text-center font-semibold text-gray-700">
                    Stok
                  </th>
                  <th className="w-32 px-4 py-3 text-center font-semibold text-gray-700">
                    Foto
                  </th>
                  <th className="w-32 px-4 py-3 text-center font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.ProdukID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border border-gray-300 text-center font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.NamaProduk}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {kategoriList.find(
                        (kategori) => kategori.kategoriID === item.kategoriID
                      )?.namaKategori || item.kategoriID}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatRupiah(item.Harga)}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.Stok}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.Foto && (
                        <img
                          src={`http://localhost:5000/uploads/${item.Foto}`}
                          alt={item.NamaProduk}
                          className="w-28 h-16 object-cover rounded-md mx-auto"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-300 flex gap-2 justify-center overflow-hidden text-ellipsis whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        title="Update stok"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        title="Hapus item"
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrintItem(item)}
                        title="Cetak detail item"
                        className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50 transition"
                      >
                        <FaPrint className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 mx-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Grafik Stok & Harga Barang */}
        <ItemChart data={sortedItems} />
      </div>

      {/* Modals */}
      {selectedItem && (
        <UpdateStockModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          handleUpdateStock={handleUpdateStock}
        />
      )}
      {showLogModal && (
        <LogModal logs={logs} onClose={() => setShowLogModal(false)} />
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StockPage;
