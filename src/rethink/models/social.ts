
import { Field, Model, Validators } from "rethinkts";

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
