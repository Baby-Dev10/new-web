import { NextResponse} from "next/server";

export async function GET(){
try {
const reqest= await NextResponse.json({
massage:"logout succsefully",
sucsee:true
})

reqest.cookies.set("token", "" ,{ httpOnly: true , expires: new Date(0)});

return reqest

} catch (error) {
return NextResponse.json({message:"your requast is not complete",sucsee:false})
}
}