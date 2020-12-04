import Resource from './Resource';
import { pick } from 'lodash';

export default class SettingsResource extends Resource {
    async build(model, schema = []) {
        let attributes = await model.getAttributes();
        attributes.push(...schema);

        return {
            ...pick(model.dataValues, attributes),
        };
    }
}