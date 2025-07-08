import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";



export async function POST(request:Request){
    await dbConnect();
     try {
        const {username,code} = await request.json()
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({
            username: { $regex: new RegExp(`^${decodedUsername}$`, 'i') }
        })
        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },{status:500})
        }
        // Debug log for verification
        console.log('DB verifyCode:', user.verifyCode, 'Input code:', code);
        const isCodeValid = String(user.verifyCode).trim() === String(code).trim();
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json({
                success:true,
                message:"Account verified successfully"
            },{status:200})
        }
        else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                message:"Verification code expired,please signup again to get new code"
            },{status:400})
        }
        else{
            return Response.json({
                success:false,
                message:"Invalid verification code "
            },{status:404})
        }
     } catch (error) {
        console.error("Error verifying user:", error);
        return Response.json({
            success:false,
            message : "Error verifying user"
        },{status: 500});
     }
}

