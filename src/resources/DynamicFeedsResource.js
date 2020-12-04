import Resource from './Resource';
import DynamicUserResource from "./DynamicUserResource";
import DynamicPostResource from "./DynamicPostResource";
import DynamicTeamResource from "./DynamicTeamResource";
import { Post } from '../models'
import { pick } from 'lodash';

export default class DynamicFeedsResource extends Resource {

    async attachAdditionalData(requester) {

        if (this.data.entity_type == 'user') {
            await this.data.entity.attachInteractionStatus(requester)
        }

        if (this.data.user_from) {
            await this.data.user_from.attachInteractionStatus(requester)
        }


        if (this.data.type === 'add_friend_request' && this.data.target_user.data.id == requester.id) {
            this.data.message = global.i18n.__(this.data.message[0] + '_', this.data.message[1])
        } else {

            this.data.message = global.i18n.__(...this.data.message);
            if (this.data.target_user) {
                this.data.message = this.data.message.replace(/<-!your!->/gi, (this.data.target_user.data.id == requester.id) ? global.i18n.__('your') : this.data.target_user.data.username);
                this.data.message = this.data.message.replace(/<-!you!->/gi, (this.data.target_user.data.id == requester.id) ? global.i18n.__('you') : this.data.target_user.data.username);
            }
        }

        return this;
    }

    async build(model, _schema = {}) {
        const schema = _schema.Feeds || { fields: [], resources: [] };
        const userSchema = schema.resources.find(i => i.User) || [];
        const userEmitterModel = await model.getEmitter({ paranoid: false });
        let emitter = null;
        if (userEmitterModel)
            emitter = await DynamicUserResource.create(userEmitterModel, userSchema);

        let targetUser;
        if (model.target_id) {
            const targetUserModel = await model.getTarget({ paranoid: false });
            targetUser = await DynamicUserResource.create(targetUserModel, userSchema);

        }


        let entity = null;
        switch (model.entity_type) {
            case 'user':
                const userEntityModel = await model.getUser({ paranoid: false });
                if (userEntityModel)
                    entity = await DynamicUserResource.create(userEntityModel, userSchema);
                break;
            case 'post':
                const postEntitySchema = schema.resources.find(i => i.Post) || [];
                const postEntityModel = await model.getPost({ paranoid: false });
                if (postEntityModel)
                    entity = await DynamicPostResource.create(postEntityModel, postEntitySchema);
                break;
            case 'team':
                const teamEntitySchema = schema.resources.find(i => i.TeamEntity) || [];
                const teamEntitymModel = await model.getTeam({ paranoid: false });
                if (teamEntitymModel)
                    entity = await DynamicTeamResource.create(teamEntitymModel, teamEntitySchema);
                break;
        }

        return {
            ...pick(model.dataValues, ['id', 'type', 'entity_type', 'created_at', ...schema]),
            message: model.message_data,
            user_from: emitter,
            target_user: targetUser,
            entity
        };
    }

}