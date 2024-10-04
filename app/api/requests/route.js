import connectMongo from "../../../utils/connectMongo";
import ReqModel from "../../../models/requestModel";
import RequestedModel from "../../../models/requestedModel";

export async function POST(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        const reqDetails = await req.json();
        
        const userData = await ReqModel.find({ username: reqDetails.clickedUsername });
        const ownData = await RequestedModel.find({ username: reqDetails.RequestedUsername });
        
        const formatDate = () => {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        };

        const obj = {
            username : reqDetails.RequestedUsername,
            date : formatDate()
        }

        const obj2 = {
            username : reqDetails.clickedUsername,
            date : formatDate()
        }

        let usernameCheck = false;
        let usernameCheckinOwn = false;

        if(userData[0].requests.lenght !== 0 && ownData[0].requested.lenght !== 0){
            userData[0].requests.forEach(item=>{
                if(item.username === reqDetails.RequestedUsername){
                    usernameCheck = true
                }
            })
            ownData[0].requested.forEach(item=>{
                if(item.username === reqDetails.clickedUsername){
                    usernameCheck = true
                }
            })
        }

        if(!usernameCheck && !usernameCheckinOwn){
            userData[0].requests.push(obj)
            ownData[0].requested.push(obj2)
        }

        await ReqModel.updateOne(
            { username: reqDetails.clickedUsername }, // Filter: document to update
            { $set: {requests : userData[0].requests} } 
        );

        await RequestedModel.updateOne(
            { username: reqDetails.RequestedUsername }, // Filter: document to update
            { $set: {requested : ownData[0].requested} } 
        );

        return Response.json({status:true, message: 'Request updated successfully' });

    } catch (error) {
        return Response.json({message:error.message})
    }
}

export async function GET(req,res){
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can specify the exact domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        await connectMongo();
        
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
    
        const requestedDetails = await RequestedModel.find({ username: username });

        return Response.json({ status: true , requested : requestedDetails[0].requested});
    } 
    catch (error) {
        return Response.json({ message: error.message });
    }
}