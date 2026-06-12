import { connectDB } from "../config/db.js";

export const testDB = async (req, res) => {
  try {
    const conn = await connectDB();

    return res.status(200).json({
      success: true,
      message: "MongoDB connected successfully",
      host: conn.connection.host,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
