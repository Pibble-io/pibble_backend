import Resource from './Resource';
import { pick } from 'lodash';

export default class GameRequestResource extends Resource {
    async build(model, schema = []) {
        const item = {
            id: model.id,
            action_type: model.action_type,
            object_id: model.game_object ? model.game_object.uuid : null,
            from: model.from_id,
            to: model.to_id,
            response: model.response
        }
        return {
            ...item, ...pick(model, ...schema),
        };
    }
}