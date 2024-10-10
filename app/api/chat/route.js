import connectMongo from "../../../utils/connectMongo";
import ChatModel from "../../../models/chatModel"
import ChatOrderModel from "../../../models/chatOrderModel"

export async function POST(req){
    try {
        await connectMongo();
        const users = await req.json();
        const newChat = users.chat

        // Helper function to format time in 'hh:mm AM/PM' format
        function formatTime(date) {
            const options = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Kolkata' // Set to Indian Standard Time (IST)
            };
        
            return date.toLocaleString('en-US', options);
        }
        
        // Helper function to format date in 'dd/mm/yyyy' format
        function formatDate(date) {
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are zero-based in JavaScript
            const year = date.getFullYear();
        
            const dayFormatted = day < 10 ? `0${day}` : day;
            const monthFormatted = month < 10 ? `0${month}` : month;
        
            return `${dayFormatted}/${monthFormatted}/${year}`;
        }

        const chatObj = await ChatModel.findOne({
            $or: [
                { $and: [{ user1: users.user }, { user2: users.oppositeUser }] },
                { $and: [{ user1: users.oppositeUser }, { user2: users.user }] }
            ]
          })

        const currentDate = new Date();
        newChat.id = chatObj.counter + 1;
        newChat.mTime = formatTime(currentDate); // Call the function with the current date
        newChat.mDate = formatDate(currentDate);

        await ChatModel.updateOne(
        { $or: [
            { $and: [{ user1: users.user }, { user2: users.oppositeUser }] },
            { $and: [{ user1: users.oppositeUser }, { user2: users.user }] }
            ]
        },
        {
            $push: { chat: newChat },
            $set: { counter : chatObj.counter + 1 }
        });

        const CurrentUserChatOrder = {
            username : users.oppositeUser,
            from : users.user,
            lastChat : newChat.chat,
            lastChatDate : formatDate(currentDate),
            lastChatTime : formatTime(currentDate)
        }

        const OppositeUserChatOrder = {
            username : users.user,
            from : users.user,
            lastChat : newChat.chat,
            lastChatDate : formatDate(currentDate),
            lastChatTime : formatTime(currentDate)
        }
        
        const isOppositePresent = await ChatOrderModel.find({
            username: users.user,
            userList: {
              $elemMatch: { username: users.oppositeUser }
            }
        });

        const isUserPresent = await ChatOrderModel.find({
            username: users.oppositeUser,
            userList: {
              $elemMatch: { username: users.user }
            }
        });

        if (isOppositePresent.length !== 0) {
          
            await ChatOrderModel.updateOne(
              { username: users.user },
              { $pull: { userList: { username: users.oppositeUser } } }
            );
          
           
            await ChatOrderModel.updateOne(
              { username: users.user },
              { $push: { userList: CurrentUserChatOrder } }
            );
        } else {
            
            await ChatOrderModel.updateOne(
              { username: users.user },
              { $push: { userList: CurrentUserChatOrder } }
            );
        }
    
        if (isUserPresent.length !== 0) {
            
            await ChatOrderModel.updateOne(
                { username: users.oppositeUser },
                { $pull: { userList: { username: users.user } } }
            );
        
        
            await ChatOrderModel.updateOne(
                { username: users.oppositeUser },
                { $push: { userList: OppositeUserChatOrder } }
            );
        } else {
       
            await ChatOrderModel.updateOne(
                { username: users.oppositeUser },
                { $push: { userList: OppositeUserChatOrder } }
            );
        }
        

        return Response.json({status:true})
    } catch (error) {
        return Response.json({message:error.message})
    }
}

export async function GET(req){
    try {
        await connectMongo();
        const { searchParams } = new URL(req.url);
        const user = searchParams.get('user');
        const opposite_person = searchParams.get('opposite_person');

        const userChats = await ChatModel.findOne({
                            $or: [
                                { $and: [{ user1: user }, { user2: opposite_person }] },
                                { $and: [{ user1: opposite_person }, { user2: user }] }
                            ]
                        })

        return Response.json({status:true,chat:userChats.chat})
    } catch (error) {
        return Response.json({message:error.message})
    }
}

