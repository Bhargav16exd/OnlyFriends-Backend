import { Router } from "express";
import { createUser, filter, forgotPassword, getAllUsers, initiateLogin, login, logout, resetPassword, serachUser, updateProfile, userProfile } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = Router();


// User Related Routes

router.route("/initiateLogin").post(initiateLogin)
router.route("/register").post(createUser)
router.route("/login").post(login)
router.route("/forgot-password").post( forgotPassword )
router.route("/reset-password/:resetToken/").post( resetPassword )
router.route("/user-profile").get(authMiddleware, userProfile) 

// Secure Routes
router.route("/logout").post( authMiddleware,logout)
router.route("/update-profile").patch( authMiddleware,updateProfile)

router.route("/search/:name").get(authMiddleware, serachUser) // done

// Get All users API PENDING
router.route("/page/:page/limit/:limit").get(authMiddleware,getAllUsers) //done
router.route("/filter/:page/limit/:limit").post(authMiddleware,filter)

export default router;