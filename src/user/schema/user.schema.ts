import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps:true})

export class User{
    @Prop({  unique: true })
    id?:string

    @Prop()
    username:string;

    @Prop()
    password:string;
}

export const UserSchema = SchemaFactory.createForClass(User)