import connectMongo from "../../../utils/connectMongo";
import GroupChatModel from "../../../models/groupChatModel"

export async function GET(req){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {

        const { searchParams } = new URL(req.url);
        const groupID = searchParams.get('groupID');
        const groupName = searchParams.get('groupName');
        
        const group = await GroupChatModel.findOne({ID : groupID , groupName : groupName})

        if(group){
            return Response.json({status:true,group:group})
        }
        else{
            return Response.json({status:false})
        }

    } catch (error) {
        return Response.json({message:error.message})
    }
}

export async function POST(req){
    try {

        const {groupInfo} = await req.json();
        const groupID = groupInfo.groupID;
        const groupName = groupInfo.groupName;

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

        const groupObj = await GroupChatModel.findOne({ID:groupID,groupName:groupName})
        const newChat = groupInfo.chat;

        const currentDate = new Date();
        newChat.id = groupObj.counter + 1;
        newChat.mTime = formatTime(currentDate); // Call the function with the current date
        newChat.mDate = formatDate(currentDate);
        
        const group = await GroupChatModel.updateOne(
            {ID : groupID , groupName : groupName},
            {
                $set : {counter : groupObj.counter + 1},
                $push : {chat : newChat}
            }
        )

        if(group){
            return Response.json({status:true})
        }
        else{
            return Response.json({status:false})
        }

    } catch (error) {
        return Response.json({message:error.message})
    }
}