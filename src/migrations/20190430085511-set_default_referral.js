import { Referral, UsersProfile, User } from '../models';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const profiles = await UsersProfile.findAll({
            include:[
                {model:User}
            ]
        });
        await Promise.all(
            profiles.map(async profile => {
                profile.referral = profile.user.username;
                await profile.save();            
            })
        )
    },

    down: async (queryInterface, Sequelize) => {
        
    }
};