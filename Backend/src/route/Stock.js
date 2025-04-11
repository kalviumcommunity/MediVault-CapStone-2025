const router = require("express").Router();
const Stock = require("../schema/StockSchema");


router.put("/create", async (req, res) => {
    const { userEmail, stock } = req.body;

    try {
        if (!userEmail || !stock || stock.length === 0) {
            return res.status(400).json({ message: "Invalid request: Missing required fields" });
        }

        
        const updatedStock = await Stock.findOneAndUpdate(
            { userEmail },
            { $push: { stock: { $each: stock } } },
            { new: true }
        );

        if (!updatedStock) {
            return res.status(404).json({ message: "No existing stock found for this user" });
        }

        res.status(200).json({ message: "Items added successfully", stock: updatedStock });
    } catch (error) {
        console.log("Error updating stock:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.get("/all", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const data = await Stock.find({})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ lastUpdated: -1 });

        const count = await Stock.countDocuments();

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data
        });

        
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
});


router.get("/user/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const userStock = await Stock.findOne({ userEmail: email });

        if (!userStock) {
            return res.status(404).json({
                success: false,
                message: "Stock not found for this user"
            });
        }

        res.status(200).json({
            success: true,
            data: userStock
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
});


router.delete("/item/:itemId", async (req, res) => {
    const { itemId } = req.params;
    const { userEmail } = req.body;

    try {
        if (!itemId || !userEmail) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: itemId and userEmail"
            });
        }

        const result = await Stock.findOneAndUpdate(
            { userEmail },
            { $pull: { stock: { _id: itemId } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User stock not found or item doesn't exist"
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock item deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Error deleting stock item:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

router.delete("/d", async (req, res) => {
    try {
        
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: "This operation is not allowed in production"
            });
        }

        const result = await Stock.deleteMany({});
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} stock records`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete stocks",
            error: err.message
        });
    }
});


router.patch("/item/:itemId", async (req, res) => {
    const { itemId } = req.params;
    const { userEmail, updates } = req.body;

    try {
        if (!itemId || !userEmail || !updates) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: itemId, userEmail, or updates"
            });
        }

        
        const setUpdates = {};
        for (const key in updates) {
            setUpdates[`stock.$.${key}`] = updates[key];
        }
        setUpdates['stock.$.updatedAt'] = new Date();
        setUpdates['lastUpdated'] = new Date();

        const result = await Stock.findOneAndUpdate(
            { userEmail, "stock._id": itemId },
            { $set: setUpdates },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Stock item not found or update failed"
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock item updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Error updating stock item:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});




router.get("/bill", async(req, res) => {
    const {userEmail} = req.query;

    try{

        const data = await Stock.findOne({userEmail})

        if(!data){
            res.status(404).json({"message" : "Stock not found"})
            return;
        }

        res.status(200).json(data.stock)


    }catch(err){
        console.log("there is an error in the /bill stock")
        console.log(err)
    }
})




router.patch("/deduct-stock", async (req, res) => {
    const { userEmail, stockId, quantityToDeduct } = req.body;
  
    try {
      // Validate input
      if (!userEmail || !stockId || quantityToDeduct === undefined || quantityToDeduct <= 0) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid parameters. Required: userEmail, stockId, quantityToDeduct (positive number)"
        });
      }
  
      // Find and update the stock item
      const updatedStock = await Stock.findOneAndUpdate(
        { 
          userEmail,
          "stock._id": stockId,
          "stock.quantity": { $gte: quantityToDeduct } // Ensure sufficient quantity
        },
        { 
          $inc: { "stock.$.quantity": -quantityToDeduct },
          $set: { 
            "stock.$.updatedAt": new Date(),
            lastUpdated: new Date() 
          }
        },
        { new: true }
      );
  
      if (!updatedStock) {
        return res.status(404).json({
          success: false,
          message: "Stock not found or insufficient quantity"
        });
      }
  
      // Find the updated stock item to return its details
      const stockItem = updatedStock.stock.find(item => item._id.equals(stockId));
  
      res.status(200).json({
        success: true,
        message: "Stock quantity deducted successfully",
        data: {
          stockId,
          stockName: stockItem.stockName,
          previousQuantity: stockItem.quantity + quantityToDeduct, // Calculate previous quantity
          newQuantity: stockItem.quantity,
          updatedStock
        }
      });
  
    } catch (error) {
      console.error("Error deducting stock:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message
      });
    }
  });



  router.put("/update-email", async (req, res) => {
    try {
      const { email, newEmail } = req.body;
  
      
      const user = await Stock.findOneAndUpdate(
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