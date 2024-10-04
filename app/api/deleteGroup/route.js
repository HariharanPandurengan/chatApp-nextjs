import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";
import GroupChatModel from "../../../models/groupChatModel"

export async function GET(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
}