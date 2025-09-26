import app from "./app";
import logger from "./config/logger.config";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  logger.info("Hello");
});
