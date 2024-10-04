import connectMongo from "../../../utils/connectMongo";
import ReqModel from "../../../models/requestModel";

export async function GET(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorizatio');
    try {
        await connectMongo();
        
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
    
        const requestsDetails = await ReqModel.find({ username: username });

        return Response.json({ status: true , requests : requestsDetails[0].requests});
    } 
    catch (error) {
        return Response.json({ message: error.message });
    }
}