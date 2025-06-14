"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardownTestDB = exports.setupTestDB = exports.umzug = void 0;
// @ts-ignore
var http_status_1 = require("http-status");
var sequelize_1 = require("sequelize");
var umzug_1 = require("umzug");
var config_1 = require("../../src/config/config");
var path = require("path");
var db_1 = require("../../src/infrastructure/db");
var sequelize = new sequelize_1.Sequelize(config_1.config.database.database_name, config_1.config.database.options.user, config_1.config.database.options.pass, {
    host: config_1.config.database.connection_url,
    dialect: "postgres",
});
exports.umzug = new umzug_1.Umzug({
    migrations: {
        glob: path.resolve(__dirname, "../../migrations/*.js"),
        resolve: function (_a) {
            var name = _a.name, path = _a.path, context = _a.context;
            var migration = require(path);
            return {
                name: name,
                up: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, migration.up({ context: context }, sequelize_1.Sequelize)];
                }); }); },
                down: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, migration.down({ context: context }, sequelize_1.Sequelize)];
                }); }); },
            };
        },
    },
    context: sequelize.getQueryInterface(),
    storage: new umzug_1.SequelizeStorage({ sequelize: sequelize }),
    logger: console,
});
var setupTestDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Connecting to database...");
                return [4 /*yield*/, sequelize.authenticate()];
            case 1:
                _a.sent();
                console.log("Connection established successfully.");
                console.log("Reverting migrations...");
                // @ts-ignore
                return [4 /*yield*/, exports.umzug.down({ to: 0 })];
            case 2:
                // @ts-ignore
                _a.sent();
                console.log("Migrations reverted.");
                console.log("Running migrations...");
                return [4 /*yield*/, exports.umzug.up()];
            case 3:
                _a.sent();
                console.log("Migrations completed.");
                console.log(http_status_1.default.OK);
                return [2 /*return*/];
        }
    });
}); };
exports.setupTestDB = setupTestDB;
var teardownTestDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("afterAll");
                console.log("Reverting all migrations...");
                // @ts-ignore
                return [4 /*yield*/, exports.umzug.down({ to: 0 })];
            case 1:
                // @ts-ignore
                _a.sent();
                console.log("Dropping test schema...");
                return [4 /*yield*/, sequelize.query("DROP SCHEMA IF EXISTS test")];
            case 2:
                _a.sent();
                console.log("Schema dropped.");
                console.log("Closing connection...");
                return [4 /*yield*/, sequelize.close()];
            case 3:
                _a.sent();
                console.log("Connection closed successfully.");
                console.log("Closing pool...");
                return [4 /*yield*/, db_1.pool.end()];
            case 4:
                _a.sent();
                console.log("Pool closed.");
                return [2 /*return*/];
        }
    });
}); };
exports.teardownTestDB = teardownTestDB;
module.exports = {
    setupTestDB: exports.setupTestDB,
    teardownTestDB: exports.teardownTestDB,
};
