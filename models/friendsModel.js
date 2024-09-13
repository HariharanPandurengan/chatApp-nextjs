import { Schema , model , models} from "mongoose";

const friendsSchema = new Schema({
    user1:String,
    user2:String
},{ collection: 'Friends' })

const FriendsModel = models.Friends || model('Friends', friendsSchema);

export default FriendsModel;