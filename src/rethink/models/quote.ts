import { Field, Model, Validators } from "rethinkts";

export class Quote extends Model {
    @Field()
    public id: string;

    @Field()
    public quote: string;

    @Field()
    public quoteID: number;

    @Field()
    public token: string;

    @Field()
    public enabled: boolean;

    @Field()
    public createdAt: any; // TODO: find a datetime thing
}
