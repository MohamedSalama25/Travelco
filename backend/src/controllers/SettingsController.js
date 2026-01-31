const Settings = require('../models/Settings.model');

/**
 * Get company settings
 * Returns the settings for the current company or creates default if none exists
 */
exports.getSettings = async (req, res, next) => {
    try {
        const companyId = req.user.companyId;
        
        let settings = await Settings.findOne({ companyId });

        if (!settings) {
            // Create default settings for this company
            settings = await Settings.create({
                companyId,
                companyName: "شركتي",
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
        const companyId = req.user.companyId;
        const { companyName, address, phone, whatsapp, coordinates } = req.body;

        let settings = await Settings.findOne({ companyId });

        if (!settings) {
            settings = await Settings.create({
                companyId,
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
