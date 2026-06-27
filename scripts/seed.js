// Re-create a fresh database (admin, demo user, sample products).
// Run with: npm run seed
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "db.json");
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Removed existing data/db.json");
}
console.log("Database will be re-seeded automatically on next app start.");
console.log("Make sure sample images exist: run `node scripts/gen-images.js` if needed.");
