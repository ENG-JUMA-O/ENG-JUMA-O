
import "dotenv/config";
import app from "./src/app.js";
import prisma from "./src/config/prisma.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check the database connection
    await prisma.$connect();
    console.log("✅ database connected!");

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();
