import Resource from '../Resource';
import { pick } from 'lodash';

export default class OAuthClientResource extends Resource {

    async build(model, schema = []) {
        return {
            ...pick(model, ['name', 'client_id', 'client_secret', 'redirect_uri'], ...schema),
        };
    }

}