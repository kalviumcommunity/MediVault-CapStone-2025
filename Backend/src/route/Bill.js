const express = require("express");
const Bill = require("../schema/billModel");

const router = express.Router();

// Route to create a new bill
router.put("/create", async (req, res) => {
    const { userEmail, items } = req.body;
  
    try {
      if (!userEmail || !items || items.length === 0) {
        return res.status(400).json({ message: "Invalid request: Missing required fields" });
      }
  
      // Calculate the total income (sum of all item prices)
      const totalIncome = items.reduce((sum, item) => sum + (item.price || 0), 0);
  
      // Find the bill and update it
      const updatedBill = await Bill.findOneAndUpdate(
        { userEmail },
        {
          $inc: { Your: totalIncome }, // Increment the "Your" field by the total income
          $push: { items: { $each: items } }, // Add new items to the "items" array
        },
        { new: true }
      );
  
      if (!updatedBill) {
        return res.status(404).json({ message: "No existing bill found for this user" });
      }
  
      res.status(200).json({ message: "Items added successfully", bill: updatedBill });
    } catch (error) {
      console.error("Error updating bill:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
// Route to get all bills for a specific user
router.get("/all", async (req, res) => {
    const { userEmail } = req.query;
    try {
        const bill = await Bill.findOne({ userEmail });

        if (!bill) {
            return res.status(404).json({ message: "No bills found" });
        }

        return res.status(200).json(bill.items);
    } catch (err) {
        console.error("Error in fetching all bills:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/all-e", async (req, res) => {
    const { userEmail } = req.query;
    try {
        const bill = await Bill.findOne({ userEmail });

        if (!bill) {
            return res.status(404).json({ message: "No bills found" });
        }

        return res.status(200).json(bill.Your);
    } catch (err) {
        console.error("Error in fetching all bills:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to delete a specific bill by ID
router.delete("/delete/:billId", async (req, res) => {
    try {
        const { billId } = req.params;

        const deletedBill = await Bill.findOneAndUpdate(
            { "items._id": billId },
            { $pull: { items: { _id: billId } } },
            { new: true }
        );

        if (!deletedBill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.status(200).json({ message: "Bill deleted successfully", bill: deletedBill });
    } catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// 🔹 Route to delete all bills for a specific user
router.delete("/delete-all", async (req, res) => {
    try {
        const { userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({ message: "User email is required" });
        }

        await Bill.findOneAndUpdate(
            { userEmail },
            { $set: { items: [] } }, // Clear the items array
            { new: true }
        );

        res.status(200).json({ message: "All bills deleted successfully" });
    } catch (error) {
        console.error("Error deleting all bills:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.put("/reset", async(req, res) => {
    const {userEmail} = req.body;
    try{
        const response =await Bill.findOneAndUpdate(
            {userEmail: userEmail},
            {Your : 0},
            {new: true}
        )
        res.status(200).json()
    }catch(err){
        console.log("Error in bill.jsx in reset")
        console.log(err)
    }
})


router.put("/update-email", async (req, res) => {
    try {
      const { email, newEmail } = req.body;
  
      
      const user = await Bill.findOneAndUpdate(
        { userEmail: email },
        { userEmail: newEmail },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ message: "Email updated successfully" });
    } catch (err) {
      console.error("Error updating shop name:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

module.exports = router;