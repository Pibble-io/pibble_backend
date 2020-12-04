const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database')[env];
const models = {};
const { upperFirst, camelCase } = require('lodash');

let i = 0;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    operatorsAliases: Sequelize.Op,
    benchmark: true,
    pool: {
        max: 800,
        min: 0,
        idle: 2000,
        acquire: 60000,
        evict: 10
    }
});

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = sequelize['import'](path.join(__dirname, file));
        models[upperFirst(camelCase(model.name))] = model;
    });

Object
    .keys(models)
    .forEach(modelName => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
