import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";

export async function POST(req){
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

