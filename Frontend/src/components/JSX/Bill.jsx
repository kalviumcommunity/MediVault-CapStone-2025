import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/Bill.css";
import { FaPlus, FaHome, FaFileInvoice, FaStore, FaUserCircle, FaTrash } from "react-icons/fa";
import { generatePath, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

const Billing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const shopName = useSelector((state) => state.auth.shopName);
  const userEmail = useSelector((state) => state.auth.userEmail);
  
  const [bills, setBills] = useState([]);
  const [stock, setStock] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [billData, setBillData] = useState({
    medicineName: "",
    customerName: "",
    date: new Date().toLocaleDateString(),
    quantity: "",
    expiryDate: "",
    manufacturingDate: "",
    price: "",
  });

  useEffect(() => {
    const fetchBills = async () => {
      if (userEmail) {
        try {
          const response = await axios.get(`http://localhost:3000/api-bills/all?userEmail=${userEmail}`);
          setBills(response.data);
        } catch (error) {
          console.error("Error fetching bills:", error);
        }
      }
    };
    fetchBills();
  }, [userEmail]);

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
      setBills([...bills, response.data.bill.items[response.data.bill.items.length - 1]]);
      
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

  const handleDelete = async (billId) => {
    try {
      await axios.delete(`http://localhost:3000/api-bills/delete/${billId}`);
      setBills(bills.filter((bill) => bill._id !== billId));
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all bills?")) {
      try {
        await axios.delete("http://localhost:3000/api-bills/delete-all", {
          data: { userEmail },
        });
        setBills([]);
      } catch (error) {
        console.error("Error deleting all bills:", error);
      }
    }
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
  };

const getFilteredMedicines = () => {
  return stock.filter(i => 
    i.stockName.toLowerCase().includes(billData.medicineName.toLowerCase()) &&
    i.quantity > 0 
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

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 MediVault</h2>
        </div>
        <button className="quick-add-btn" onClick={() => navigate("/Stock")}>
          <FaPlus /> Add Stock
        </button>
        <nav>
          <ul>
            <li onClick={() => navigate("/Home")}><FaHome /> Home</li>
            <li className="active"><FaFileInvoice /> Billing</li>
            <li onClick={() => navigate("/Stock")}><FaStore /> Stock</li>
            <li onClick={() => navigate("/Profile")}><FaUserCircle /> Profile</li>
          </ul>
        </nav>
        <div className="faq-section">
          <p>Have some questions?</p>
          <button className="faq-btn">Look at the FAQs</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <h2 className="NAM">{shopName}</h2>
          <div className="user-section">
            <button className="logout-button" onClick={() => dispatch(logout())}>Logout</button>
          </div>
        </header>
        <hr />

        <div className="button-container">      
          <button className="create-bill" onClick={() => setIsModalOpen(true)}>+ Create Bill</button>
          {bills.length > 0 && (
            <button className="Delete-all" onClick={handleDeleteAll}><FaTrash/> Delete all</button>
          )}
        </div>

        {bills.length > 0 ? (
          <table className="bill-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, index) => (
                <tr key={bill._id}>
                  <td>{index + 1}</td>
                  <td>{bill.date}</td>
                  <td>{bill.customerName}</td>
                  <td>₹{bill.price}/-</td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => handleView(bill)}>View</button>
                    <button className="delete-btn" onClick={() => handleDelete(bill._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-bills">
            <p>No bills found. Create your first bill!</p>
          </div>
        )}
      </div>

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
                          {medicine.stockName}<p></p>
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

      {/* View Bill Modal */}
      {selectedBill && (
        <div className="modal-overlay" onClick={() => setSelectedBill(null)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bill Details</h2>
            <div className="bill-details">
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{selectedBill.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{selectedBill.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Medicine Name:</span>
                <span className="detail-value">{selectedBill.medicineName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quantity:</span>
                <span className="detail-value">{selectedBill.quantity}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">MFG Date:</span>
                <span className="detail-value">{selectedBill.manufacturingDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">EXP Date:</span>
                <span className="detail-value">{selectedBill.expiryDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">₹{selectedBill.price}/-</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setSelectedBill(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;