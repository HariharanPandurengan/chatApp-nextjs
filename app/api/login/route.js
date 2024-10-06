import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";
import bcrypt from 'bcrypt';

export async function POST(req,res){
    try {
        await connectMongo();
        const loginDetails = await req.json();
        
        const userData = await UserModel.find({ username: loginDetails.username });
        if(userData.length === 1){
            const passwordCheck = await bcrypt.compare(loginDetails.password,userData[0].password)
            if(passwordCheck){
                return Response.json({status:true})
            }
            else{
                return Response.json({status:false})
            }
        }
        else{
            return Response.json({status:false})
        }
    } catch (error) {
        return Response.json({message:error.message})
    }
}

