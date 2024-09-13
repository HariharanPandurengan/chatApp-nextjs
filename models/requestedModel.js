import { Schema , model , models} from "mongoose";

const reqSchema = new Schema({
    username:String,
    requested:Array
},{ collection: 'Requested' })

const RequestedModel = models.Requested || model('Requested', reqSchema);

export default RequestedModel;