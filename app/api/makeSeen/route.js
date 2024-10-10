import connectMongo from "../../../utils/connectMongo";
import ChatModel from "../../../models/chatModel"

export async function POST(req){
    try {
        await connectMongo();
        const users = await req.json();
        const user = users.user
        const opposite_user = users.oppositeUser

        await ChatModel.updateOne(
        { $or: [
            { $and: [{ user1: user }, { user2: opposite_user }] },
            { $and: [{ user1: opposite_user }, { user2: user }] }
            ]
        },
        {
            $set: {
                "chat.$[elem].seen": true 
            }
        },
        {
            arrayFilters: [ { "elem.from": opposite_user} ] 
        });

        return Response.json({status:true})
    } catch (error) {
        return Response.json({message:error.message})
    }
}