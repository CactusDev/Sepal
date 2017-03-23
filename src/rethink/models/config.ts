
import { Field, Model } from "rethinkts";

export class Config extends Model {
    @Field()
    public id: string;

    @Field()
    public token: string;

    @Field()
    public services: Object;

    @Field()
    public announce: Object;

    @Field()
    public spam: Object;

    @Field()
    public whitelist: Object;
}
