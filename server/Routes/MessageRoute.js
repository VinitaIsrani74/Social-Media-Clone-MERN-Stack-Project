import express from 'express'
import { addMessage, getMessage } from '../controllers/MessageController.js'
const router = express.Router()

router.post('/',addMessage)
router.get('/:chatId', getMessage)

export default router