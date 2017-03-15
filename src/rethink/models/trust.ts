
import { Field, Model, Validators } from "rethinkts";

export class Trust extends Model {
    @Field()
    public id: string;

    @Field()
    public userName: string;

    @Field()
    public userId: string;

    @Field()
    public active: boolean;

    @Field()
    public token: string;

    @Field()
    public createdAt: any; // TODO: find datetime thing
}
