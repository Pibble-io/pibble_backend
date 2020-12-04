'use strict';
import {
    PromotionTransaction,
} from '../models';


module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable(PromotionTransaction.tableName, PromotionTransaction.attributes),

    down: (queryInterface, Sequelize) => queryInterface.dropTable(PromotionTransaction.tableName),

};