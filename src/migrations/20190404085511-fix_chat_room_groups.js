import { ChatRoomGroup, Post } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(ChatRoomGroup.tableName, ChatRoomGroup.attributes);
        await queryInterface.addColumn('chat_rooms', 'group_id', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        const goods = await queryInterface.sequelize.query(
            'SELECT * FROM `chat_rooms` WHERE `type` = :type',
            {
                replacements: { type: 'goods' },
                type: queryInterface.sequelize.QueryTypes.SELECT,
            },
        );

        function getUnique(arr, comp) {

            const unique = arr
                .map(e => e[comp])

                // store the keys of the unique objects
                .map((e, i, final) => final.indexOf(e) === i && i)

                // eliminate the dead keys & store unique objects
                .filter(e => arr[e]).map(e => arr[e]);

            return unique;
        }

        const rooms = getUnique(goods, 'post_id');
        return Promise.all(rooms.map(async (item) => {
            console.log('POST:', item.post_id);
            if (item.post_id) {
                const post = await Post.findOne({ where: { id: item.post_id }, paranoid: false });
                console.log('POST:', post.id, ' found');
                if (post.id) {
                    const [group, isNewGroup] = await ChatRoomGroup.findOrCreate({
                        where: { post_id: post.id },
                        defaults: { post_id: post.id, owner: post.user_id },
                    });
                    await queryInterface.sequelize.query(
                        'UPDATE chat_rooms SET group_id = :group_id WHERE id = :room_id',
                        { replacements: { group_id: group.id, room_id: item.id } }
                    );
                    console.log(`UPDATE chat_rooms SET group_id = ${group.id} WHERE id = ${item.id}`)
                }
            }
        }));

        // await queryInterface.removeColumn('chat_rooms', 'post_id')
    },

    down: async (queryInterface, Sequelize) => {

    }
};