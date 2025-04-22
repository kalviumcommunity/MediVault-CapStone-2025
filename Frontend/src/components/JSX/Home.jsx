

import React, {useState, useEffect} from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaPlus, FaBox, FaFileInvoice, FaStore, FaExclamationTriangle, FaInfoCircle, FaHome } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { logout } from "../redux/authSlice"; // Import logout action
import "../CSS/Home.css"; // Importing the updated CSS file

const Dashboard = () => {
  const navigate = useNavigate(); // Hook for navigation
  const dispatch = useDispatch(); // Get Redux dispatch function
  const shopName = useSelector((state) => state.auth.shopName); // Get shop name from Redux store
  const userEmail = useSelector((state) => state.auth.userEmail);

    const [billData, setBillData] = useState({
      medicineName: "",
      customerName: "",
      date : new Date().toLocaleDateString(),  // This extracts only the date (YYYY-MM-DD)
  
      quantity: "",
      expiryDate: "",
      manufacturingDate: "",
      price: "",
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stock, setStock] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);


    useEffect(() => {
      const fetchStock = async () => {
        if (userEmail) {
          try {
            const response = await axios.get(`http://localhost:3000/api-stock/bill?userEmail=${userEmail}`);
            setStock(response.data);
          } catch (error) {
            console.error("Error fetching Stock:", error);
          }
        }
      };
      fetchStock();
    }, [userEmail]);

  const handleChange = (e) => {
    setBillData({ ...billData, [e.target.name]: e.target.value });
    if (e.target.name === "medicineName") {
      setShowSuggestions(true);
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (
      !billData.customerName?.trim() ||
      !billData.medicineName?.trim() ||
      !billData.quantity?.trim() ||
      !billData.manufacturingDate?.trim() ||
      !billData.expiryDate?.trim() ||
      !billData.price?.trim()
    ) {
      return alert("Please fill all required fields");
    }
  
    // Check if medicine exists in stock
    const availableMedicines = getFilteredMedicines();
    if (!availableMedicines || availableMedicines.length === 0) {
      return alert(`${billData.medicineName} is not available in stock`);
    }
  
    // Find the exact medicine in stock
    const selectedMedicine = availableMedicines.find(
      med => med.stockName.toLowerCase() === billData.medicineName.toLowerCase()
    );
  
    if (!selectedMedicine) {
      return alert(`${billData.medicineName} not found in stock`);
    }
  
    // Convert quantities to numbers
    const requestedQuantity = Number(billData.quantity);
    const currentStockQuantity = Number(selectedMedicine.quantity);
  
    // Validate sufficient quantity
    if (requestedQuantity > currentStockQuantity) {
      return alert(`Only ${currentStockQuantity} pieces available (requested ${requestedQuantity})`);
    }
  
    try {
      // First deduct the stock quantity using the new endpoint
      await axios.patch("http://localhost:3000/api-stock/deduct-stock", {
        userEmail,
        stockId: selectedMedicine._id,  // Using stock ID instead of name
        quantityToDeduct: requestedQuantity
      });
  
      // Then create the bill
      const response = await axios.put("http://localhost:3000/api-bills/create", {
        userEmail,
        items: [billData],
      });
  
      // Update local state
      
      
      // Update local stock data
      setStock(stock.map(item => 
        item._id === selectedMedicine._id 
          ? { ...item, quantity: currentStockQuantity - requestedQuantity }
          : item
      ));
  
      // Reset form
      setBillData({
        medicineName: "",
        customerName: "",
        date: new Date().toLocaleDateString(),
        quantity: "",
        expiryDate: "",
        manufacturingDate: "",
        price: "",
      });
  
    } catch (err) {
      console.log("Error:", err);
      alert("Failed to complete transaction. Please try again.");
    }
  
    setIsModalOpen(false);
  };



  const getFilteredMedicines = () => {
    return stock.filter(i => 
      i.stockName.toLowerCase().includes(billData.medicineName.toLowerCase())
    );
  };

  const handleMedicineSelect = (medicine) => {
    setBillData(prev => ({
      ...prev,
      medicineName: medicine.stockName,
      manufacturingDate: medicine.manufacturingDate?.split("T")[0] || "",
      expiryDate: medicine.expiryDate?.split("T")[0] || "",
    }));
    setShowSuggestions(false);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setBillData({
      medicineName: "",
      customerName: "",
      date: new Date().toLocaleDateString(),
      quantity: "",
      expiryDate: "",
      manufacturingDate: "",
      price: "",
    });
    setShowSuggestions(true);
  };

  

  // Logout Function
  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 MediVault</h2>
        </div>
        <button className="quick-add-btn">
          <FaPlus /> Add Stock
        </button>
        <nav>
          <ul>
            <li className="active"><FaHome /> Home</li>
            <li onClick={() => navigate("/Billing")}><FaFileInvoice /> Billing</li>
            <li onClick={() => navigate("/Stock")}><FaStore /> Stock</li>
            <li onClick={() => navigate("/Profile")}><FaUserCircle /> Profile</li>
          </ul>
        </nav>
        <div className="faq-section">
          <p>Have some questions?</p>
          <button className="faq-btn">Look at the FAQs</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <h2 className="NAM">{shopName}</h2>
          <div className="user-section">
            {/* Logout Button */}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Banner */}
        <section className="banner">
          <div className="banner-content">
            <h2 className="T">Your Inventory</h2>
            <button className="bill-btn" onClick={() => setIsModalOpen(true)}><FaPlus /> Create Bill</button>
          </div>
          <img src="https://www.shutterstock.com/image-vector/male-doctor-smiling-happy-face-600nw-2481032615.jpg" alt="Doctors" className="banner-img" />
        </section>

        {/* Stats Section */}
        <section className="stats">
          <div className="stat-card">
            <p>Out of stock products</p>
            <span className="alert-icon"><FaExclamationTriangle /></span>
            <h3>3</h3>
          </div>
          <div className="stat-card">
            <p>Products on low stock</p>
            <span className="info-icon"><FaInfoCircle /></span>
            <h3>3</h3>
          </div>
          <div className="stat-card">
            <p>Total Number of stocks</p>
            
            <h3>12</h3>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts">
          <div className="chart-card">
            <h4>Weighted Score</h4>
            <img src="https://www.shutterstock.com/image-vector/pie-chart-3-divisions-260nw-2237665079.jpg" alt="Weighted Score" />
          </div>
          <div className="chart-card">
            <h4>Stock Percentage</h4>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPORuSR2p7MViDa7wrhv0iZk_iwZXgrxel4w&s" alt="Stock Percentage" />
          </div>
        </section>
      </main>
      {/* Create Bill Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => resetModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Bill</h2>
            
            <div className="form-group">
              <label>Customer Name</label>
              <input 
                type="text" 
                name="customerName" 
                value={billData.customerName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Medicine Name</label>
              <input
                type="text"
                name="medicineName"
                value={billData.medicineName}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              {showSuggestions && billData.medicineName && (
                <div className="medicine-suggestions">
                  {getFilteredMedicines().length > 0 ? (
                    <ol>
                      {getFilteredMedicines().map((medicine, index) => (
                        <li key={index} onClick={() => handleMedicineSelect(medicine)}>
                          {medicine.stockName}
                          {medicine.quantity}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="no-suggestions">No matching medicines found</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                value={billData.quantity} 
                onChange={handleChange} 
                min="1"
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Manufacturing Date</label>
                <input 
                  type="date" 
                  name="manufacturingDate" 
                  value={billData.manufacturingDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="date" 
                  name="expiryDate" 
                  value={billData.expiryDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input 
                type="number" 
                name="price" 
                value={billData.price} 
                onChange={handleChange} 
                min="0"
                step="0.01"
                required 
              />
            </div>

            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
              <button className="cancel-btn" onClick={resetModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
