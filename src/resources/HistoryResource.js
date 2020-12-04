import Resource from './Resource';
import { pick } from 'lodash';
import TagResource from "./TagResource";
import UserResource from "./UserResource";
import PlaceResource from "./PlaceResource";
import { User } from "../models";

export default class HistoryResource extends Resource {


    async build(model, schema = []) {
        let entity;

        switch (model.entity_type) {
            case 'tag':
                entity = await TagResource.create( await model.getTag());
                await entity.attachFlagsState();
                break;
            case 'user':
                entity = await UserResource.create( await model.getUser());
                await entity.attachInteractionStatus( await User.findById(model.user_id) );
                break;
            case 'place':
                entity = await PlaceResource.create( await model.getPlace());
                await entity.attachFlagsState();
                break;
        }

        return {
            ...pick(model, ['user_id', 'entity_type', 'updated_at', ...schema]),
            entity,
        };
    }
}

