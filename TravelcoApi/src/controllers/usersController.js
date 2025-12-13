// const asyncWrapper = require("../middlewares/asyncWarpper");
const Users = require("../models/Users.model");
// const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

const getUsers = async(req,res)=>{
try{
        const {  limit, skip } = getPagination(req);
        const users = await Users.find({},{"__v":false,"password":false}).limit(limit).skip(skip);
        return res.status(200).json(users);
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

module.exports={
    getUsers
}