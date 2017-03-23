
import { Field, Model } from "rethinkts";

/**
 * Event database model
 * 
 * @export
 * @class Event
 * @extends {Model}
 */
export class Event extends Model {
    @Field()
    public id: string;

    @Field()
    public channel: string;

    @Field()
    public user: string;

    @Field()
    public event: string;

    @Field()
    public occurredAt: string;
}
