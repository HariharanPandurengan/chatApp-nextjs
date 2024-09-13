import { Schema , model , models} from "mongoose";

const chatSchema = new Schema({
    user1:String,
    user2:String,
    counter:Number, // Counter to keep track of the next auto-increment value
    chat: Array
},{ collection: 'Chat' })

const ChatModel = models.Chat || model('Chat', chatSchema);

export default ChatModel;