import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";
import ReqModel from "../../../models/requestModel";
import RequestedModel from "../../../models/requestedModel";

export async function POST(req){
    try {
        await connectMongo();
        const registerDetails = await req.json();
        
        const userData = await UserModel.find({ username: registerDetails.username});
        if(userData.length === 1){
            return Response.json({message:'User already exist',status:false})
        }
        else{
            const user = new UserModel({
                username: registerDetails.username,
                password: registerDetails.password,
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