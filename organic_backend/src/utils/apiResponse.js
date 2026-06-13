export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ status: true, data, message });
};

export const errorResponse = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({ status: false, error: { code, message } });
};