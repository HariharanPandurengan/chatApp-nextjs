import connectMongo from "../../../utils/connectMongo";
import FriendsModel from "../../../models/friendsModel"
import ChatModel from "../../../models/chatModel"

export async function POST(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        const reqDetails = await req.json();

        try {
            // remove friends
            await FriendsModel.deleteOne({
                $or: [
                  { $and: [{ user1: reqDetails.currentUsername }, { user2: reqDetails.clickedUsername }] },
                  { $and: [{ user1: reqDetails.clickedUsername }, { user2: reqDetails.currentUsername }] }
                ]
            })

            await ChatModel.deleteOne({
                $or: [
                  { $and: [{ user1: reqDetails.currentUsername }, { user2: reqDetails.clickedUsername }] },
                  { $and: [{ user1: reqDetails.clickedUsername }, { user2: reqDetails.currentUsername }] }
                ]
            })
      
            return Response.json({ status: true , message: 'Both are unfriended now' });
        } catch (error) {
            return Response.json({ error: 'Failed to friends' });
        }
        
        
    } catch (error) {
        return Response.json({message:error.message})
    }
}
