export const paginate = (data, total, page, limit) => ({
  data,
  pagination: {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  },
});