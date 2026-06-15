// Global error handler — converts raw Prisma errors into clean, frontend-friendly responses
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // P2002 — Unique constraint violation (e.g. duplicate slug, email, sku)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      status: false,
      error: { code: 'DUPLICATE_ENTRY', message: `${field} already exists` },
    });
  }

  // P2025 — Record not found (update/delete on non-existent record)
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: false,
      error: { code: 'NOT_FOUND', message: 'Record not found' },
    });
  }

  // P2003 — Foreign key constraint failed (e.g. invalid categoryId, productId)
  if (err.code === 'P2003') {
    const field = err.meta?.field_name || 'related record';
    return res.status(400).json({
      status: false,
      error: { code: 'INVALID_REFERENCE', message: `Invalid reference: ${field} does not exist` },
    });
  }

  // P2014 — Relation violation (deleting a record that other records depend on)
  if (err.code === 'P2014') {
    return res.status(400).json({
      status: false,
      error: { code: 'RELATION_CONFLICT', message: 'Cannot delete — related records exist' },
    });
  }

  // P2000 — Value too long for column type
  if (err.code === 'P2000') {
    const column = err.meta?.column_name || 'field';
    return res.status(400).json({
      status: false,
      error: { code: 'VALUE_TOO_LONG', message: `Value for ${column} is too long` },
    });
  }

  // P2011 — Null constraint violation (required field missing)
  if (err.code === 'P2011') {
    const field = err.meta?.target || 'field';
    return res.status(400).json({
      status: false,
      error: { code: 'MISSING_FIELD', message: `${field} cannot be null` },
    });
  }

  // P2023 — Inconsistent column data (e.g. invalid UUID format passed)
  if (err.code === 'P2023') {
    return res.status(400).json({
      status: false,
      error: { code: 'INVALID_DATA_FORMAT', message: 'Invalid data format provided' },
    });
  }

  // P1001 / P1002 — Database connection issues
  if (err.code === 'P1001' || err.code === 'P1002') {
    return res.status(503).json({
      status: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Database connection failed, please try again later' },
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: false,
      error: { code: 'FILE_UPLOAD_ERROR', message: err.message },
    });
  }

  // JSON parsing errors (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: false,
      error: { code: 'INVALID_JSON', message: 'Malformed JSON in request body' },
    });
  }

  // Default fallback for everything else (custom thrown errors, unexpected errors)
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong';

  return res.status(statusCode).json({ status: false, error: { code, message } });
};