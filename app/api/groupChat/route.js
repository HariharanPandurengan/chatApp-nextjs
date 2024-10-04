import connectMongo from "../../../utils/connectMongo";
import GroupChatModel from "../../../models/groupChatModel"
import UserModel from "../../../models/userModel";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        const { group } = await req.json();
        const groupName = group.name
        const members = group.members
        const admin = group.admin

        let groupId;
        let groupExists = true;

        while (groupExists) {
            groupId = uuidv4();

            // Check if this groupId already exists in the database
            const existingGroup = await GroupChatModel.findOne({ID:groupId})
            
            if (!existingGroup) {
            groupExists = false;
            }
        }

        const newGroup = new GroupChatModel({
            ID:groupId,
            groupName:groupName,
            admin:admin,
            members:members,
            counter:0,
            chat: []
        });

        await newGroup.save()

        members.map(async user=>{
            await UserModel.updateOne(
                {username : user},
                {$push : {groups: {groupID:groupId,groupName:groupName}}}
            )
        })

        await UserModel.updateOne(
            {username : admin},
            {$push : {groups: {groupID:groupId,groupName:groupName}}}
        )

        return Response.json({status:true})

    } catch (error) {
        return Response.json({message:error.message})
    }
}

export async function GET(req){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        const user = await UserModel.findOne({username:username})

        return Response.json({groups:user.groups})

    } catch (error) {
        return Response.json({message:error.message})
    }
}