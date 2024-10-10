import connectMongo from "../../../utils/connectMongo";
import FriendsModel from "../../../models/friendsModel"
import ChatModel from "../../../models/chatModel"
import ChatOrderModel from "../../../models/chatOrderModel"

export async function POST(req){
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

            await ChatOrderModel.updateOne(
                { username :reqDetails.currentUsername },
                { $pull : { userList : { username : reqDetails.clickedUsername }} }
            )
      
            return Response.json({ status: true , message: 'Both are unfriended now' });
        } catch (error) {
            return Response.json({ error: 'Failed to friends' });
        }
        
        
    } catch (error) {
        return Response.json({message:error.message})
    }
}
