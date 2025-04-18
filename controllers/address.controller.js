import asyncHandler from "../src/utils/asyncHandler";

export const address = asyncHandler(async(req,res)=>{
    const {address} = req.body
    console.log(address);
})