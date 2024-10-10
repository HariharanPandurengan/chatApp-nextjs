import { Schema , model , models} from "mongoose";

const chatOderSchema = new Schema({
    username : String,
    userList : Array,
    groupList : Array,
},{ collection: 'ChatOrder' })

const ChatOrderModel = models.ChatOrder || model('ChatOrder', chatOderSchema);

export default ChatOrderModel;