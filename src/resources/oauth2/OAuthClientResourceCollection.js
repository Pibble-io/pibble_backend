import ResourceCollection from '../ResourceCollection';
import OAuthClientResource from "./OAuthClientResource";

export default class OAuthClientResourceCollection extends ResourceCollection {

    itemResource = OAuthClientResource;

}