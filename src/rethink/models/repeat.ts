
import { Field, Model } from "rethinkts";

/**
 * Repeat database model
 * 
 * @export
 * @class Repeat
 * @extends {Model}
 */
export class Repeat extends Model {
    @Field()
    public id: string;

    @Field()
    public period: number;

    @Field()
    public token: string;

    @Field()
    public repeatName: string;

    @Field()
    public command: string;

    @Field()
    public commandName: string;

    @Field()
    public createdAt: string;
}
