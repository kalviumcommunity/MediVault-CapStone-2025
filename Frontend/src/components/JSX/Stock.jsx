import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, FaUserCircle, FaPlus, FaBox, FaFileInvoice, 
  FaStore, FaExclamationTriangle, FaInfoCircle, FaHome, 
  FaSearch, FaEdit, FaTrash, FaTimes, FaSave 
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import axios from "axios";
import "../CSS/Stock.css";

const StockDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const shopName = useSelector((state) => state.auth.shopName);
    const userEmail = useSelector((state) => state.auth.userEmail);
    const [stockData, setStockData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 10;


   

    const [formData, setFormData] = useState({
        stockName: "",
        suplierName: "",
        orderedDate: "",
        deliveredDate: "",
        quantity: 1,
        expiryDate: "",
        manufacturingDate: "",
        netPrice: 0,
        batchNumber: "",
        notes: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {

        const fetchStockData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api-stock/all");
                if (response.data.success) {
                    setStockData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching stock data:", error);
                alert("Failed to load stock data");
            }
        };



        fetchStockData();
    }, [userEmail]);


   



    const fetchstockData = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api-stock/all");
            if (response.data.success) {
                setStockData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching stock data:", error);
            alert("Failed to load stock data");
        }
    };

    

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const handleAddStock = () => {
        setShowForm(true);
        setEditingId(null);
        setFormData({
            stockName: "",
            suplierName: "",
            orderedDate: "",
            deliveredDate: "",
            quantity: 1,
            expiryDate: "",
            manufacturingDate: "",
            netPrice: 0,
            batchNumber: "",
            notes: ""
        });
    };

    const handleEdit = (item) => {
        setShowForm(true);
        setEditingId(item._id);
        setFormData({
            stockName: item.stockName,
            suplierName: item.suplierName,
            orderedDate: item.orderedDate ? new Date(item.orderedDate).toISOString().split('T')[0] : "",
            deliveredDate: item.deliveredDate ? new Date(item.deliveredDate).toISOString().split('T')[0] : "",
            quantity: item.quantity,
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
            manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate).toISOString().split('T')[0] : "",
            netPrice: item.netPrice,
            batchNumber: item.batchNumber || "",
            notes: item.notes || ""
        });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.stockName.trim()) newErrors.stockName = "Stock name is required";
        if (!formData.suplierName.trim()) newErrors.suplierName = "Supplier name is required";
        if (!formData.orderedDate) newErrors.orderedDate = "Order date is required";
        if (!formData.deliveredDate) newErrors.deliveredDate = "Delivery date is required";
        if (new Date(formData.deliveredDate) < new Date(formData.orderedDate)) {
            newErrors.deliveredDate = "Delivery date must be after order date";
        }
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity must be positive";
        if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
        if (!formData.manufacturingDate) newErrors.manufacturingDate = "Manufacturing date is required";
        if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
            newErrors.expiryDate = "Expiry date must be after manufacturing date";
        }
        if (!formData.netPrice || formData.netPrice < 0) newErrors.netPrice = "Price must be positive";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const stockItem = {
            stockName: formData.stockName,       
            suplierName: formData.suplierName,    
            orderedDate: new Date(formData.orderedDate),       // Must be Date object
            deliveredDate: new Date(formData.deliveredDate),    // Must be ≥ orderedDate
            manufacturingDate: new Date(formData.manufacturingDate), // Must be Date
            expiryDate: new Date(formData.expiryDate),         // Must be > manufacturingDate
            quantity: Number(formData.quantity),  // Must be ≥ 1
            netPrice: Number(formData.netPrice),  // Must be ≥ 0
            batchNumber: formData.batchNumber,    // Optional (will be trimmed)
            notes: formData.notes                 // Optional (will be trimmed)
          };
    
        const response = await axios.put("http://localhost:3000/api-stock/create", {
          userEmail, 
          stock: [stockItem]
        });


        

        
        setShowForm(false)
    
        // Handle success...
      } catch (error) {
        console.error("Full error:", {
          request: error.config.data, // Check what was actually sent
          response: error.response?.data
        });
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this stock item?")) {
            try {
                await axios.delete(`http://localhost:3000/api-stock/item/${id}`, {
                    data: { userEmail }
                });
                fetchstockData();
            } catch (error) {
                console.error("Error deleting stock:", error);
                alert(`Failed to delete stock item: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const filteredStock = stockData
        .filter(userStock => userStock.userEmail === userEmail)
        .flatMap(userStock => 
            userStock.stock
                .filter(item => 
                    item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.suplierName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(item => ({ ...item, userEmail: userStock.userEmail }))
        );

    const paginatedStock = filteredStock.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>🏥 MediVault</h2>
                </div>
                <button className="quick-add-btn" onClick={handleAddStock}>
                    <FaPlus /> Add Stock
                </button>
                <nav>
                    <ul>
                        <li onClick={() => navigate("/Home")}><FaHome /> Home</li>
                        <li onClick={() => navigate("/Billing")}><FaFileInvoice /> Billing</li>
                        <li className="active"><FaStore /> Stock</li>
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
                <header className="top-header">
                    <h2 className="NAM">{shopName}</h2>
                    <div className="user-section">
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <div className="stock-controls">
                    <button className="add-stock-btn" onClick={handleAddStock}>
                        <FaPlus /> Add New Stock
                    </button>
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search stock..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {showForm && (
                    <div className="stock-form-container">
                        <div className="stock-form">
                            <div className="form-header">
                                <h3>{editingId ? "Edit Stock Item" : "Add New Stock Item"}</h3>
                                <button className="close-btn" onClick={() => setShowForm(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Stock Name*</label>
                                        <input
                                            type="text"
                                            name="stockName"
                                            value={formData.stockName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.stockName && <span className="error">{errors.stockName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Supplier Name*</label>
                                        <input
                                            type="text"
                                            name="suplierName"
                                            value={formData.suplierName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.suplierName && <span className="error">{errors.suplierName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ordered Date*</label>
                                        <input
                                            type="date"
                                            name="orderedDate"
                                            value={formData.orderedDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.orderedDate && <span className="error">{errors.orderedDate}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Delivered Date*</label>
                                        <input
                                            type="date"
                                            name="deliveredDate"
                                            value={formData.deliveredDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.deliveredDate && <span className="error">{errors.deliveredDate}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Manufacturing Date*</label>
                                        <input
                                            type="date"
                                            name="manufacturingDate"
                                            value={formData.manufacturingDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.manufacturingDate && <span className="error">{errors.manufacturingDate}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Expiry Date*</label>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity*</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.quantity && <span className="error">{errors.quantity}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Net Price*</label>
                                        <input
                                            type="number"
                                            name="netPrice"
                                            min="0"
                                            step="0.01"
                                            value={formData.netPrice}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.netPrice && <span className="error">{errors.netPrice}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Batch Number</label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={formData.batchNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Processing..." : <>{editingId ? <FaSave /> : <FaSave />} {editingId ? "Update" : "Save"}</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="stock-summary">
                    <div className="summary-card">
                        <h3>Total Items</h3>
                        <p>{filteredStock.length}</p>
                    </div>
                    <div className="summary-card warning">
                        <h3>Expiring Soon</h3>
                        <p>{
                            filteredStock.filter(item => 
                                new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ).length
                        }</p>
                    </div>
                </div>

                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Stock Name</th>
                            <th>Supplier</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedStock.map((item, index) => (
                            <tr key={`${item._id}-${index}`} 
                                className={new Date(item.expiryDate) < new Date() ? "expired" : ""}>
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{item.stockName}</td>
                                <td>{item.suplierName}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.netPrice.toFixed(2)}</td>
                                <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn edit" onClick={() => handleEdit(item)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(item._id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button 
                        disabled={filteredStock.length <= currentPage * itemsPerPage}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StockDashboard;