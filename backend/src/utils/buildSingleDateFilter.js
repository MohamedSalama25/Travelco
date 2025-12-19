const buildSingleDateFilter = (dateStr) => {
    if (!dateStr) return null;

    let date;

    // ISO or Date string
    if (!dateStr.includes("/")) {
        date = new Date(dateStr);
    } else {
        // dd/mm/yyyy
        const parts = dateStr.split("/");
        if (parts.length !== 3) return null;

        const [day, month, year] = parts.map(Number);
        date = new Date(year, month - 1, day);
    }

    if (isNaN(date.getTime())) return null;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return {
        $gte: startOfDay,
        $lte: endOfDay
    };
};

module.exports = buildSingleDateFilter;