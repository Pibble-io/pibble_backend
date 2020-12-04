import config from './index'

module.exports = {
    development: {
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        host: config.DB_HOST,
        dialect: "mysql",
        define: {
            charset: 'utf8mb4',
            paranoid: false,
            timestamps: true,
            underscored: true
        },
        migrationStorageTableName: "sequelize_meta",
        logging: (sql) => console.log(sql)
    },
    test: {
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        host: config.DB_HOST,
        dialect: "mysql",
        define: {
            charset: 'utf8mb4',
            paranoid: false,
            timestamps: true,
            underscored: true
        },
        migrationStorageTableName: "sequelize_meta"
    },
    production: {
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        host: config.DB_HOST,
        dialect: "mysql",
        define: {
            charset: 'utf8mb4',
            paranoid: false,
            timestamps: true,
            underscored: true
        },
        migrationStorageTableName: "sequelize_meta",
        logging: false
    }
};
