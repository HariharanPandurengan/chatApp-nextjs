import { Schema , model , models} from "mongoose";

const userSchema = new Schema({
    username:String,
    password:String
},{ collection: 'Users' })

const UserModel = models.User || model('User', userSchema);

export default UserModel;