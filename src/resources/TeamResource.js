import Resource from './Resource';
import UserResource from "./UserResource";
import CampaignResource from "./CampaignResource";
import { pick } from 'lodash';
import { FundingTransaction, UsersTeams } from "../models";

export default class TeamResource extends Resource {

    async attachFlagsState(requester) {
        if (requester.id == this.data.user.data.id) {
            this.data.status = 'creator';
        }
        else {
            const info = await UsersTeams.find({ where: { team_id: this.data.id, user_id: requester.id } });
            if (info) {
                this.data.status = info.joined_at ? 'member' : 'invited';
            }
            else {
                this.data.status = 'available';
            }

            await this.data.user.attachInteractionStatus(requester);
        }

        return this.data;
    }

    async build(model, schema = []) {

        let campaign = await model.getCampaign();
        campaign = campaign ? await CampaignResource.create(campaign) : {};

        return {
            ...pick(model, ['id', 'name', 'created_at', ...schema]),
            logo: model.logo_id ? (await model.getLogo({ attributes: ['s3Key']})).get('url') : null,
            user: await UserResource.create( await model.getUser()),
            members_count: await model.countMembers(),
            campaign,
        };
    }
}