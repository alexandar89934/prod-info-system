import { setupTestDB } from "./setupTestDB";

module.exports = async () => {
  console.log("Setting up test DB");
  await setupTestDB();
};
