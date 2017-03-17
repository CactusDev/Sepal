
import { Field, Model, Validators } from "rethinkts";

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
    public comamnd: string;

    @Field()
    public commandName: string;
}
