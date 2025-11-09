// Utility functions can be added here
const calculatePagination = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    totalItems,
    totalPages,
    currentPage: page,
    nextPage,
    prevPage,
    limit
  };
};

module.exports = { calculatePagination };