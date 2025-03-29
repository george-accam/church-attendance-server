import { titheAndWelfare } from "../models/titheAndWelfareModel.js";

//  Create a new tithe and welfare record
export const createTitheAndWelfare = async (req, res) => {
    const { userId, userFullName, fullName, amount, category } = req.body;
    try {
        if (!fullName || !amount || !category) {
            return res.status(400).json({ success: false, message: "all fields are required" });
        }

        let selectedCategory = "Tithe";
        if (category === "Welfare") {
            selectedCategory = "Welfare";
        }
        // Find the most recent check-in for the user
        const lastCreated = await titheAndWelfare.findOne({ _id: titheAndWelfare._id }).sort({ createdAt: -1 });

        // Check if 12 hours have passed since the last check-in
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        if (lastCreated && lastCreated.createdAt > twelveHoursAgo) {
            return res.status(400).json({ message: "you can only input amount once in once" });
        }

        const newTitheAndWelfare = new titheAndWelfare({ userId, userFullName, fullName, amount, category: selectedCategory });

        // save the new tithe and welfare
        const savedTitheAndWelfare = await newTitheAndWelfare.save();
        res.status(201).json({ success: true, message: "recorded successfully", savedTitheAndWelfare: savedTitheAndWelfare });

    } 
    catch (error) {
        res.status(409).json({ message: error.message });
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