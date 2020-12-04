export default {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('settings', [{
        key: 'promotion_coin_symbol',
        value: 'PIB',
    }, {
        key: 'promotion_reward_coin_symbol',
        value: 'PRB',
    },{
        key: 'promotion_debit_transaction_type',
        value: '110',
    },{
        key: 'promotion_like_transaction_type',
        value: '111',
    },{
        key: 'promotion_share_transaction_type',
        value: '112',
    },{
        key: 'promotion_collect_transaction_type',
        value: '113',
    },{
        key: 'promotion_tag_transaction_type',
        value: '114',
    },{
        key: 'promotion_up_vote_transaction_type',
        value: '115',
    },{
        key: 'promotion_like_amount',
        value: '1',
    },{
        key: 'promotion_like_rate',
        value: '10',
    },{
        key: 'promotion_collect_amount',
        value: '1',
    },{
        key: 'promotion_collect_rate',
        value: '10',
    },{
        key: 'promotion_tag_amount',
        value: '1',
    },{
        key: 'promotion_tag_rate',
        value: '10',
    },{
        key: 'promotion_share_amount',
        value: '1',
    },{
        key: 'promotion_share_rate',
        value: '10',
    },{
        key: 'promotion_up_vote_amount',
        value: '1',
    },{
        key: 'promotion_up_vote_rate',
        value: '10',
    }], {
        ignoreDuplicates: true
    }),

    down: (queryInterface, Sequelize) => queryInterface.bulkDelete('settings', null, {})
};