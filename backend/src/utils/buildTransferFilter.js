const Customer = require("../models/Customer.model");

const buildTransferFilter = async (query) => {
    const {
        name,
        booking_number,
        status,
        air_comp,
        createdAt,
        fromDate,
        toDate
    } = query;

    const filter = {};

    if (name) {
        const customers = await Customer
            .find({ name: { $regex: name, $options: "i" } })
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
        if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    return filter;
};

module.exports = buildTransferFilter;
