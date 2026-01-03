const Settings = require('../models/Settings.model');

/**
 * Get company settings
 * Returns the only settings document or creates a default one if none exists
 */
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({
                companyName: "شركة ترافيلكو",
                address: "",
                phone: "",
                whatsapp: "",
                coordinates: { lat: 30.0444, lng: 31.2357 }
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update company settings
 */
exports.updateSettings = async (req, res, next) => {
    try {
        const { companyName, address, phone, whatsapp, coordinates } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                companyName,
                address,
                phone,
                whatsapp,
                coordinates
            });
        } else {
            settings.companyName = companyName || settings.companyName;
            settings.address = address !== undefined ? address : settings.address;
            settings.phone = phone !== undefined ? phone : settings.phone;
            settings.whatsapp = whatsapp !== undefined ? whatsapp : settings.whatsapp;
            settings.coordinates = coordinates !== undefined ? coordinates : settings.coordinates;

            await settings.save();
        }

        res.status(200).json({
            success: true,
            message: "تم تحديث الإعدادات بنجاح",
            data: settings
        });
    } catch (err) {
        next(err);
    }
};
