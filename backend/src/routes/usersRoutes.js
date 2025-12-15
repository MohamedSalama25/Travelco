const express=require('express');
const router=express.Router();
const UsersControllers=require('../controllers/usersController');


router.get('/',UsersControllers.getUsers);



module.exports=router;