function getPagination(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // max 100
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = getPagination;
