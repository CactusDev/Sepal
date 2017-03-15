
import { Field, Model, Validators } from "rethinkts";

export class Command extends Model {
    @Field()
    public id: string;

    @Field()
    public name: string;

    @Field()
    public response: Object[];

    @Field()
    public createdAt: any; // TODO: Find datetime thing

    @Field()
    public token: string;

    @Field()
    public enabled: boolean;

    @Field()
    public arguments: Object;

    @Field()
    public count: number;
}
