import connectMongo from "../../../utils/connectMongo";
import ChatOrderModel from "../../../models/chatOrderModel"

export async function POST(req){
    try {
        await connectMongo();
        const details = await req.json();
        const username = details.username;
        const chatOrder = await ChatOrderModel.findOne({ username : username })
        return Response.json({ chatOrder : chatOrder.userList })
        
    } catch (error) {
        return Response.json({message:error.message})
    }
}