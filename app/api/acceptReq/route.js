import connectMongo from "../../../utils/connectMongo";
import ReqModel from "../../../models/requestModel";
import RequestedModel from "../../../models/requestedModel";
import FriendsModel from "../../../models/friendsModel"
import ChatModel from "../../../models/chatModel"

export async function POST(req){
    try {
        await connectMongo();
        const reqDetails = await req.json();

        try {
            // Update for request accepting user
            await ReqModel.updateOne(
              { username : reqDetails.currentUsername }, 
              { $pull: { requests: { username: reqDetails.requestedUsername } } } 
            );
      
        } catch (error) {
            console.log({ error: 'Failed to remove requests' });
        }

        try {
            // Update for oppsite requested person
            await RequestedModel.updateOne(
              { username : reqDetails.requestedUsername }, 
              { $pull: { requested: { username: reqDetails.currentUsername } } } 
            );
  
        } catch (error) {
            console.log({ error: 'Failed to remove requested' });
        }

        try {
            // making both of them friends
            const friends = new FriendsModel({
                user1: reqDetails.currentUsername,
                user2: reqDetails.requestedUsername,
            });
          
            await friends.save();

            const chat = new ChatModel({
                user1: reqDetails.currentUsername,
                user2: reqDetails.requestedUsername,
                counter:0,
                chat: []
            });
          
            await chat.save();
      
            return Response.json({status : true, message: 'Both are friends now' });
        } catch (error) {
            return Response.json({ error: 'Failed to friends' });
        }
        
        
    } catch (error) {
        return Response.json({message:error.message})
    }
}
