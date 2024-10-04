import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";

export async function POST(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        const loginDetails = await req.json();
        
        const userData = await UserModel.find({ username: loginDetails.username ,password:loginDetails.password});
        if(userData.length === 1){
            return Response.json({status:true})
        }
        else{
            return Response.json({status:false})
        }
    } catch (error) {
        return Response.json({message:error.message})
    }
}

