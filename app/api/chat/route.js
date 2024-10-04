import connectMongo from "../../../utils/connectMongo";
import ChatModel from "../../../models/chatModel"

export async function POST(req,res){
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    try {
        await connectMongo();
        const users = await req.json();
        const newChat = users.chat

        // Helper function to format time in 'hh:mm AM/PM' format
        function formatTime(date) {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight as 12
            const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
        
            return `${hours}:${minutesFormatted} ${ampm}`;
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

