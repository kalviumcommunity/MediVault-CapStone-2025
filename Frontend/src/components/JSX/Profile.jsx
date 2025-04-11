import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaPlus, FaBox, FaFileInvoice, FaStore, FaExclamationTriangle, FaInfoCircle, FaHome, FaPencilAlt, FaSyncAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux"; 
import { logout } from "../redux/authSlice"; 
import axios from "axios";
import "../CSS/Profile.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const shopName = useSelector((state) => state.auth.shopName);
  const userEmail = useSelector((state) => state.auth.userEmail);


  const [editMode, setEditMode] = useState(false);
  const [newShopName, setNewShopName] = useState(shopName);
  const [newEmail, setNewEmail] = useState(userEmail);
  const [emailEdit, setEmailEdit] = useState(false);
  const [Earn, setEarn] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(false);


  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/");
  };


  useEffect(() => {
    const change = async() => {
      try{
        const response = await axios.get(`http://localhost:3000/api-bills/all-e?userEmail=${userEmail}`)
        setEarn(response.data)
        console.log("useEffect running");
      }catch(err){
        console.log("Error in profile", err)
      }
    }
    change()
  },[userEmail, resetTrigger])


  const handleUpdateShopName = async () => {
    try {
    
      const response = await axios.put("http://localhost:3000/api/update-shop-name", {
        email: userEmail,
        newShopName: newShopName,
      });

      if (response.status === 200) {
        dispatch({
          type: "auth/updateShopName",
          payload: { shopName: newShopName },
        });

        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating shop name:", error);
    }
  };



  const handleEmail = async() => {
    try{
      const ree = await axios.put("http://localhost:3000/api/update-email",{
        email : userEmail,
        newEmail : newEmail
      })


      const re = await axios.put("http://localhost:3000/api-bills/update-email",{
        email : userEmail,
        newEmail : newEmail
      })


      const r = await axios.put("http://localhost:3000/api-stock/update-email",{
        email : userEmail,
        newEmail : newEmail
      })




      if (ree.status == 200 && re.status == 200 && r.status == 200){
        dispatch({
          type: "auth/updateEmail",
          payload : {userEmail : newEmail}
        })
        console.log("Done email")
      }else{
        console.log("Not Done Email")
      }
      
      setEmailEdit(false)
    }catch(err){
      console.log(err);
    }
  }

  const reset = async() => {
    try{
      const response = await axios.put("http://localhost:3000/api-bills/reset",{
        userEmail
      }
    )

      if(response.status === 200){
        
        setResetTrigger((prev) => !prev);
      }
      
    }catch(err){
      console.log("Error in profile")
      console.log(err)
    }
  }



  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 MediVault</h2>
        </div>
        <button className="quick-add-btn">
          <FaPlus /> Add Stock
        </button>
        <nav>
          <ul>
            <li onClick={() => navigate("/Home")}><FaHome /> Home</li>
            <li onClick={() => navigate("/Billing")}><FaFileInvoice /> Billing</li>
            <li onClick={() => navigate("/Stock")} ><FaStore /> Stock</li>
            <li className="active"><FaUserCircle /> Profile</li>
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

        {/* Profile Section */}
        <div className="profile-content">
          <div className="profile-header">
            <FaUserCircle className="user-icon" />
            <h2 className="Profile-title">Profile</h2>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Shop Name:</span>
              <div className="shop-name-container">
                {editMode ? (
                  <input
                    type="text"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    className="shop-name-input"
                  />
                ) : (
                  <span className="detail-value">{shopName}</span>
                )}
                <FaPencilAlt
                  className="pencil-icon"
                  onClick={() => setEditMode(!editMode)}
                />
              </div>
            </div>
            {editMode && (
              <div className="edit-buttons">
                <button onClick={handleUpdateShopName} className="save-button">
                  Save
                </button>
                <button onClick={() => setEditMode(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <div className="shop-name-container">{emailEdit ? (
                <input 
                type="text"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="shop-name-input"
                />
              ) : (
                <span className="detail-value">{userEmail}</span>
              )}
              <FaPencilAlt className="pencil-icon" onClick={() => setEmailEdit(!emailEdit)}/>
              </div>
            </div>
            {emailEdit && (
              <div className="edit-buttons">
                <button onClick={handleEmail} className="save-button">
                  Save
                </button>
                <button onClick={() => setEmailEdit(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            )}
            <div className="detail-item earnings">
              <span className="detail-label">Your Earnings:</span>
              <span className="detail-value">₹{Earn}</span>   
            </div>
            <div className="btnn">
              {Earn != 0 ? (<button className="Reset" onClick={reset}><FaSyncAlt className="Faa"/>Reset</button>)
              : (<button className="Reset" disabled = {true}><FaSyncAlt className="Faa"/>Reset</button>)
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;