import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";
import ReqModel from "../../../models/requestModel";
import RequestedModel from "../../../models/requestedModel";
import bcrypt from 'bcrypt';

export async function POST(req,res){
    
    try {
        await connectMongo();
        const registerDetails = await req.json();

        const hashedPassword = await bcrypt.hash(registerDetails.password, 10);
        
        const userData = await UserModel.find({ username: registerDetails.username});
        if(userData.length === 1){
            return Response.json({message:'User already exist',status:false})
        }
        else{
            const user = new UserModel({
                username: registerDetails.username,
                password: hashedPassword,
                groups:[]
              });
          
            const savedUser = await user.save();

            const req = new ReqModel({
                username: registerDetails.username,
                requests: [],
            });
          
            await req.save();

            const requsted = new RequestedModel({
                username: registerDetails.username,
                requested: [],
            });
          
            await requsted.save();

            return Response.json({message:'User inserted successfully'+savedUser,status:true})
        }
    } catch (error) {
        return Response.json({message:error.message})
    }
}