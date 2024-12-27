import { teardownTestDB } from "./setupTestDB";

module.exports = async () => {
    await teardownTestDB();
};