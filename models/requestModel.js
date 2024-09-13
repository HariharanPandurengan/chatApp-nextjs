import { Schema , model , models} from "mongoose";

const reqSchema = new Schema({
    username:String,
    requests:Array
},{ collection: 'Requests' })

const ReqModel = models.Requests || model('Requests', reqSchema);

export default ReqModel;