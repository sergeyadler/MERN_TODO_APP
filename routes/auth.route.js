const {Router}= require('express')

const router = Router()
const User = require('../models/User')

const {check, validationResult} = require('express-validator')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



router.post('/registration', 
[
    check('email', 'Email is wrong').isEmail(),
    check('password', 'Password is wrong').isLength({min: 6})
],
async (req, res)=>{
    try {

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect data during registration'
            })
        }

        const {email, password}= req.body

        const isUsed = await User.findOne({ email })

        if(isUsed){
            return res.status(300).json({message:'This Email is alerady exist, please try another one!'})
        }

            const hashedPassword = await bcrypt.hash(password, 12)

            const user = new User({
                email, password: hashedPassword
            })

            await user.save()
            res.status(201).json({message:'User has been created'})

    } catch (error) {
        console.log(error)  
    }
})




router.post('/login', 
[
    check('email', 'Email is wrong').isEmail(),
    check('password', 'Password is wrong').exists()
],    
async (req, res)=>{
    try {

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect data during registration'
            })
        }

        const {email, password}= req.body

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message: 'Email does not exist'})
        }

        const isMatch= bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: 'Wrong Password'})

        }

        const jwtSecret = 'qwevscregrefewd23e23rfeegreg4332rdcdcsvrevere2r324535t##RF$%@@@!@E$RSDFG'
        const token = jwt.sign(
            {userId: user.id},
            jwtSecret, 
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})


    } catch (error) {
        console.log(error)  
    }
})



module.exports = router