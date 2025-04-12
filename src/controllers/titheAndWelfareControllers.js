import { titheAndWelfare } from "../models/titheAndWelfareModel.js";

//  Create a new tithe and welfare record
export const createTitheAndWelfare = async (req, res) => {
    const { userId, userFullName, fullName, amount, category } = req.body;
    
    try {
        // Validate required fields
        if (!fullName || !amount || !category) {
            return res.status(400).json({ 
                success: false, 
                message: "all fields are required" 
            });
        }

        // Find the most recent entry of the same category for this user
        const lastEntry = await titheAndWelfare.findOne({ 
            fullName,
            category 
        }).sort({ createdAt: -1 });

        // Check if 12 hours have passed since the last entry of this category
        if (lastEntry) {
            const twelveHoursInMs = 6 * 60 * 60 * 1000;
            const timeSinceLastEntry = Date.now() - new Date(lastEntry.createdAt).getTime();
            
            if (timeSinceLastEntry < twelveHoursInMs) {
                return res.status(400).json({ 
                    success: false, 
                    message: `you can only submit ${category} once` 
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
        res.status(500).json({ 
            success: false, 
            message: `Internal server error: ${error.message}`,
            error: error.message 
        });
    }
}

export const searchTitheAndWelfare = async (req, res) => {
    const query  = req.query.q; 
    try {
        const titheAndWelfareData = await titheAndWelfare.find({ 
                $or: [
                    {fullName: { $regex: query, $options: "i"}},
                    {dateCreated: {$regex: query, $options: "i"}}
                ] 
            }).sort({ createdAt: -1 });


        // Organize data by date and calculate totals
        let totalOverallAmount = 0;
        let totalTitheAmount = 0;
        let totalWelfareAmount = 0;
        
        const dataByDate = titheAndWelfareData.reduce((acc, item) => {
            const dateKey = new Date(item.dateCreated).toISOString().split("T")[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
            
            // Add to totals
            if (item.amount) {
                totalOverallAmount += item.amount;
                
                // Add to specific category total
                if (item.category === 'Tithe') {
                    totalTitheAmount += item.amount;
                } else if (item.category === 'Welfare') {
                    totalWelfareAmount += item.amount;
                }
            }
            
            return acc;
        }, {});

        // Calculate total amount by date and by category
        const totalAmountByDate = {};
        const titheAmountByDate = {};
        const welfareAmountByDate = {};
        
        Object.keys(dataByDate).forEach(date => {
            // Total for all records on this date
            totalAmountByDate[date] = dataByDate[date].reduce((sum, item) => {
                return sum + (item.amount || 0);
            }, 0);
            
            // Tithe-only total for this date
            titheAmountByDate[date] = dataByDate[date]
                .filter(item => item.category === 'Tithe')
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            
            // Welfare-only total for this date
            welfareAmountByDate[date] = dataByDate[date]
                .filter(item => item.category === 'Welfare')
                .reduce((sum, item) => sum + (item.amount || 0), 0);
        });

        res.status(200).json({ 
            success: true, 
            message: "tithe and welfare data retrieved successfully", 
            titheAndWelfareData: dataByDate,
            totalAmountByDate: totalAmountByDate,
            titheAmountByDate: titheAmountByDate,
            welfareAmountByDate: welfareAmountByDate,
            totalAmount: totalOverallAmount,
            totalTitheAmount: totalTitheAmount,
            totalWelfareAmount: totalWelfareAmount,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};


// Get all tithe and welfare records with separate totals including monthly totals
export const getTitheAndWelfare = async (req, res) => {
    try {
        const titheAndWelfareData = await titheAndWelfare.find({}).sort({ createdAt: -1 });

        // If no data found
        if(titheAndWelfareData.length === 0) {
            return res.status(404).json({ success: false, message: "No dues found" });
        }

        // Organize data by date and calculate totals
        let totalOverallAmount = 0;
        let totalTitheAmount = 0;
        let totalWelfareAmount = 0;
        
        const dataByDate = titheAndWelfareData.reduce((acc, item) => {
            const dateKey = new Date(item.dateCreated).toISOString().split("T")[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(item);
            
            // Add to totals
            if (item.amount) {
                totalOverallAmount += item.amount;
                
                // Add to specific category total
                if (item.category === 'Tithe') {
                    totalTitheAmount += item.amount;
                } else if (item.category === 'Welfare') {
                    totalWelfareAmount += item.amount;
                }
            }
            
            return acc;
        }, {});

        // Calculate total amount by date and by category
        const totalAmountByDate = {};
        const titheAmountByDate = {};
        const welfareAmountByDate = {};
        
        // New objects for monthly totals
        const totalAmountByMonth = {};
        const titheAmountByMonth = {};
        const welfareAmountByMonth = {};
        
        Object.keys(dataByDate).forEach(date => {
            const dateObj = new Date(date);
            const monthYearKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            
            // Initialize month totals if not exists
            if (!totalAmountByMonth[monthYearKey]) {
                totalAmountByMonth[monthYearKey] = 0;
                titheAmountByMonth[monthYearKey] = 0;
                welfareAmountByMonth[monthYearKey] = 0;
            }
            
            // Total for all records on this date
            const dateTotal = dataByDate[date].reduce((sum, item) => {
                return sum + (item.amount || 0);
            }, 0);
            totalAmountByDate[date] = dateTotal;
            totalAmountByMonth[monthYearKey] += dateTotal;
            
            // Tithe-only total for this date
            const dateTitheTotal = dataByDate[date]
                .filter(item => item.category === 'Tithe')
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            titheAmountByDate[date] = dateTitheTotal;
            titheAmountByMonth[monthYearKey] += dateTitheTotal;
            
            // Welfare-only total for this date
            const dateWelfareTotal = dataByDate[date]
                .filter(item => item.category === 'Welfare')
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            welfareAmountByDate[date] = dateWelfareTotal;
            welfareAmountByMonth[monthYearKey] += dateWelfareTotal;
        });

        // Convert monthly totals to an array of objects for easier consumption
        const monthlyTotals = Object.keys(totalAmountByMonth).map(monthYear => {
            return {
                monthYear,
                month: new Date(`${monthYear}-01`).toLocaleString('default', { month: 'long', year: 'numeric' }),
                totalAmount: totalAmountByMonth[monthYear],
                titheAmount: titheAmountByMonth[monthYear],
                welfareAmount: welfareAmountByMonth[monthYear]
            };
        }).sort((a, b) => new Date(`${a.monthYear}-01`) - new Date(`${b.monthYear}-01`));

        res.status(200).json({ 
            success: true, 
            message: "tithe and welfare data retrieved successfully", 
            titheAndWelfareData: dataByDate,
            totalAmountByDate: totalAmountByDate,
            titheAmountByDate: titheAmountByDate,
            welfareAmountByDate: welfareAmountByDate,
            totalAmount: totalOverallAmount,
            totalTitheAmount: totalTitheAmount,
            totalWelfareAmount: totalWelfareAmount,
            monthlyTotals: monthlyTotals,
            totalAmountByMonth: totalAmountByMonth,
            titheAmountByMonth: titheAmountByMonth,
            welfareAmountByMonth: welfareAmountByMonth
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