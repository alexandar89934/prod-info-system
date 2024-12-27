module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_CONNECTION_STRING,
        dialect: "postgres",
    },
    test: {
        username: "postgres",
        password: "postgres",
        database: "smart-watering",
        host: "127.0.0.1",
        dialect: "postgres",
        schema: "test",
    },
    staging: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_CONNECTION_STRING,
        dialect: "postgres",
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_CONNECTION_STRING,
        port: process.env.DB_INTERNAL_PORT,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                ca: process.env.DB_CA_CERT,
                rejectUnauthorized: true,
            },
        },
    },
};
