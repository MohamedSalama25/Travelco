/**
 * Utility functions for company filtering in queries
 * Used across all controllers to ensure data isolation per company
 */

/**
 * Add companyId filter to a query filter object
 * @param {Object} filter - The existing filter object
 * @param {String} companyId - The company ID from req.user
 * @returns {Object} - The filter object with companyId added
 */
const addCompanyFilter = (filter, companyId) => {
  if (!companyId) {
    throw new Error("Company ID is required for filtering");
  }
  return {
    ...filter,
    companyId: companyId
  };
};

/**
 * Create a base filter with companyId
 * @param {String} companyId - The company ID from req.user
 * @returns {Object} - A filter object with just companyId
 */
const getCompanyFilter = (companyId) => {
  if (!companyId) {
    throw new Error("Company ID is required for filtering");
  }
  return { companyId: companyId };
};

/**
 * Middleware to verify resource belongs to user's company
 * Use this before update/delete operations
 * @param {Model} Model - The Mongoose model
 * @param {String} paramName - The request parameter name for ID (default: 'id')
 */
const verifyCompanyOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const companyId = req.user.companyId;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "معرف المورد مطلوب"
        });
      }

      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "المورد غير موجود"
        });
      }

      if (resource.companyId.toString() !== companyId.toString()) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بالوصول إلى هذا المورد"
        });
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

module.exports = {
  addCompanyFilter,
  getCompanyFilter,
  verifyCompanyOwnership
};
