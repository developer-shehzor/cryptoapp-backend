const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next) {
        // 1.validate user input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        })

        const { error } = userRegisterSchema.validate(req.body);

        // 2.if error in validation -> return error via middleware
        if (error) {
            return next(error)
        }
        // 3. if email or username is already registered -> return an error
        const {username, name, email, password} = req.body;

        try{
            const emailInUse = await User.exists({email});

            const usernameInUse = await User.exists({username});

            if (emailInUse) {
                const error = {
                    status : 409,
                    message: 'Email already registered, use another email!'
                }

                return next(error);
            }

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: 'Username not available, choose another username'
                }

                return next(error);
            }
        }
        catch(error){
            return next(error);
        }

        // 4. password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. store user data in db
        let accessToken;
        let refreshToken;

        let user;

        try {
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashedPassword,
            })
    
            user = await userToRegister.save();

            // token generation 
            accessToken = JWTService.signAccessToken({_id: user._id}, '30m');

            refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');
        }
        catch(error) {
            return next(error);
        }

        // store refresh token in db
        await JWTService.storeRefreshToken(refreshToken, user._id)

        // send tokens in cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        const userDto = new UserDTO(user);

        // 6. response send
        return res.status(201).json({user: userDto, auth: true});
    },

    async login(req, res, next) {

        // 1. validate user input
        // we expect input data to be in such shape
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern)
        });

        // 2. if validation error, return error
        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        // 3. match username and password

        const { username, password } = req.body;

        // const username = req.body.username;
        // const password = req.body.password;

        let user;

        try {
            // match username
            user = await User.findOne({username: username})

            if (!user) {
                const error = {
                    status: 401,
                    message: 'Invalid username'
                }

                return next(error);
            }

            // match passowrd
            // req.body.password -> hash -> match

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                const error = {
                    status: 401,
                    message: 'Invalid password'
                }

                return next(error);
            }
        } 
        catch (error) {
            return next(error);
        }

        const accessToken = JWTService.signAccessToken({_id: user._id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');

        // update refresh token in database
        try {
            await RefreshToken.updateOne({
                _id: user._id,
    
            },
            {token: refreshToken},
            {upsert: true}
            )
        }
        catch(error) {
            return next(error);
        }

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        const userDto = new UserDTO(user);
        // 4. return response
        return res.status(200).json({user: userDto, auth: true});
    },
}

module.exports = authController;