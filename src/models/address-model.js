import mongoose,{ Schema } from "mongoose";

const addressSchema = new Schema({
    userId:{type:Schema.Types.ObjectId,ref:'User'},
    firstName:{type:String,required:true,trim:true},
    lastName:{type:String,required:true,trim:true},
    email:{type:String,trim:true,lowercase: true},
    zipCode:{type:String},
    country:{type:String,enum: ['Bangladesh'],default: 'Bangladesh'},
    district:{type:String,required:true},
    fullAddress:{type:String},
    phoneNumber:{type:String,required:true}
})

export default addressSchema = mongoose.model("Address", addressSchema);