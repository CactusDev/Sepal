
import { Field, Model } from "rethinkts";

/**
 * Social database model
 * 
 * @export
 * @class Social
 * @extends {Model}
 */
export class Social extends Model {
    @Field()
    public id: string;

    @Field()
    public token: string;

    @Field()
    public service: string;

    @Field()
    public url: string;
}
