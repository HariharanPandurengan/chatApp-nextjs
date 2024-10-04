import connectMongo from "../../../utils/connectMongo";
import UserModel from "../../../models/userModel";

export async function GET(req,res) {
 
    try {
      await connectMongo();
      
      const { searchParams } = new URL(req.url);
      const username = searchParams.get('username');
  
      const userData = await UserModel.find({ username: { $regex: new RegExp(`^${username}`, 'i') } });
  
      if (userData.length >= 1) {
        return Response.json({ status: true , users : userData});
      } else {
        return Response.json({ status: false });
      }
    } catch (error) {
      return Response.json({ message: error.message });
    }
  }