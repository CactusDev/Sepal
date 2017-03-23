
import { Field, Model } from "rethinkts";

/**
 * Command database model
 * 
 * @export
 * @class Command
 * @extends {Model}
 */
export class Command extends Model {
    @Field()
    public id: string;

    @Field()
    public name: string;

    @Field()
    public response: Object[];

    @Field()
    public createdAt: string;

    @Field()
    public token: string;

    @Field()
    public enabled: boolean;

    @Field()
    public arguments: Object[];

    @Field()
    public count: number;
}
