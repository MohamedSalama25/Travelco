function errorRes(messege,res){
return res.status(400).json({
        success: false,
        message: messege
      })
}
module.exports=errorRes
    