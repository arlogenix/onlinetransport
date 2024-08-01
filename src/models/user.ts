import { InferSchemaType, model, Schema } from "mongoose";

const userSchema=new Schema({
    id:{type:String,required:true,unique: true},
    name:{type:String,required:false},
    email:{type:String,required:false},
    sessionid:{ type: Schema.Types.ObjectId, ref: 'Session', required: false },
    phoneNumber:{type:String,required:true,unique: true},
 
},{timestamps:true});

type User=InferSchemaType<typeof userSchema>;

export default model<User>("User",userSchema);