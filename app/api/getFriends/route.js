import connectMongo from "../../../utils/connectMongo";
import FriendsModel from "../../../models/friendsModel"

export async function GET(req,res){

    try {
        await connectMongo();
        
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
    
        const Friends = await FriendsModel.find({
            $or: [
              {user1: username},
              {user2: username}
            ]
          })
        return Response.json({ status: true , friends : Friends});
    } 
    catch (error) {
        return Response.json({ message: error.message });
    }
}