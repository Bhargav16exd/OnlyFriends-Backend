import {Router} from "express"
import authMiddleware from "../middlewares/auth.middleware.js"
import { addReply, listRecievedLetters, sendLetter, sentLetters, viewRecievedLetter, viewSentLetter } from "../controllers/letter.controller.js"

const router = Router()

// Send Letter API
router.route('/send-letter/:to').post(authMiddleware , sendLetter) 
// View Sent Letter API
router.route('/list-sent-letters').get(authMiddleware , sentLetters) 
router.route('/view-sent-letter/:id').get(authMiddleware , viewSentLetter) 
router.route('/add-comment/:id').post(authMiddleware , addReply)
router.route('/view-recieved-letter/:id').get(authMiddleware , viewRecievedLetter)
router.route('/list-recieved-letters').get(authMiddleware , listRecievedLetters)


export default router