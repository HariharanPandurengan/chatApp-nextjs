import { Schema , model , models} from "mongoose";

const groupChatSchema = new Schema({
    ID:String,
    groupName:String,
    admin:Array,
    members:Array,
    counter:Number,
    chat: Array
},{ collection: 'GroupChat' })

const GroupChatModel = models.GroupChat || model('GroupChat', groupChatSchema);

export default GroupChatModel;