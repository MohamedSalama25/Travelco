const Customer = require("../models/Customer.model");

/**
 * Build filter for Transfer queries with companyId support
 * @param {Object} query - Query parameters from request
 * @param {String} companyId - Company ID from req.user.companyId
 */
const buildTransferFilter = async (query, companyId) => {
    const {
        name,
        booking_number,
        status,
        air_comp,
        createdAt,
        fromDate,
        toDate
    } = query;

    // Start with companyId filter - MANDATORY
    if (!companyId) {
        throw new Error("Company authentication required");
    }
    const filter = { companyId: companyId };

    if (name) {
        // Also filter customers by company
        const customerFilter = { name: { $regex: name, $options: "i" } };
        if (companyId) {
            customerFilter.companyId = companyId;
        }
        const customers = await Customer
            .find(customerFilter)
            .select("_id");

        filter.customer = { $in: customers.map(c => c._id) };
    }

    if (booking_number) {
        filter.booking_number = { $regex: booking_number, $options: "i" };
    }

    if (status) {
        if (status.includes(',')) {
            filter.status = { $in: status.split(',') };
        } else {
            filter.status = status;
        }
    }

    if (air_comp) {
        filter.air_comp = air_comp;
    }
    if (createdAt) {
        const date = new Date(createdAt);

        if (!isNaN(date.getTime())) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.createdAt = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }
    }


    if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = new Date(fromDate);
        if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = endOfDay;
        }
    }

    return filter;
};

module.exports = buildTransferFilter;
