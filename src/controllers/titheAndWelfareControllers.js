import { titheAndWelfare } from "../models/titheAndWelfareModel.js";

//  Create a new tithe and welfare record
export const createTitheAndWelfare = async (req, res) => {
    const { userId, userFullName, fullName, amount, category } = req.body;
    
    try {
        // Validate required fields
        if (!fullName || !amount || !category) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Find the most recent entry of the same category for this user
        const lastEntry = await titheAndWelfare.findOne({ 
            userId,
            category 
        }).sort({ createdAt: -1 });

        // Check if 12 hours have passed since the last entry of this category
        if (lastEntry) {
            const twelveHoursInMs = 12 * 60 * 60 * 1000;
            const timeSinceLastEntry = Date.now() - new Date(lastEntry.createdAt).getTime();
            
            if (timeSinceLastEntry < twelveHoursInMs) {
                return res.status(400).json({ 
                    success: false, 
                    message: `You can only submit ${category} once every 12 hours` 
                });
            }
        }

        // Create new entry
        const newEntry = new titheAndWelfare({ 
            userId, 
            userFullName, 
            fullName, 
            amount, 
            category 
        });

        // Save the new entry
        const savedEntry = await newEntry.save();
        
        res.status(201).json({ 
            success: true, 
            message: `${category} recorded successfully`, 
            data: savedEntry 
        });

    } catch (error) {
        console.error("Error creating tithe/welfare:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
}

//  Get all tithe and welfare records
export const getTitheAndWelfare = async (req, res) => {
    try {
        const titheAndWelfareData = await titheAndWelfare.find().sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            message: "tithe and welfare data retrieved successfully", 
            titheAndWelfareData: titheAndWelfareData 
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};

// Get a single tithe and welfare record
export const getSingleTitheAndWelfare = async (req, res) => {
    const { userId } = req.params;
    try {
        const singleTitheAndWelfare = await titheAndWelfare.find({userId}).sort({ createdAt: -1 });

        if (!singleTitheAndWelfare) {
            return res.status(404).json({ success: false, message: "tithe and welfare record not found" });
        }
        res.status(200).json({ success: true, message: "tithe and welfare record retrieved successfully", singleTitheAndWelfare: singleTitheAndWelfare });
    }
    catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};

//  update a single tithe and welfare record
export const updateTitheAndWelfare = async (req, res) => {
    const { id } = req.params;
    const { fullName, amount, category } = req.body;

    if (!fullName || !amount || !category) {
        return res.status(400).json({ message: "all fields are required" });
    }

    try {
        const updatedTitheAndWelfare = await titheAndWelfare.findByIdAndUpdate(id, { fullName, amount, category }, { new: true });

        if (!updatedTitheAndWelfare) {
            return res.status(404).json({ success: false, message: "tithe and welfare record not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "tithe and welfare record updated successfully", 
            updatedTitheAndWelfare: updatedTitheAndWelfare 
        });
    }
    catch(error){
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};

//  delete a single tithe and welfare record
export const deleteTitheAndWelfare = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTitheAndWelfare = await titheAndWelfare.findByIdAndDelete(id);
        if (!deletedTitheAndWelfare) {
            return res.status(404).json({ success: false, message: "tithe and welfare record not found" });
        }
        res.status(200).json({ success: true, message: "tithe and welfare record deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};