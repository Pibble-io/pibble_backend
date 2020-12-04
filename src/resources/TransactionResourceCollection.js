import ResourceCollection from './ResourceCollection'
import TransactionResource from "./TransactionResource";

export default class TransactionResourceCollection extends ResourceCollection {
    itemResource = TransactionResource;

}