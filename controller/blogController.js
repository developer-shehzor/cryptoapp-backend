const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const { BACKEND_SERVER_PATH } = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const Comment = require('../models/comment');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
    async create(req, res, next){
        // 1. validate req body
        // 2. handle photo storage, naming
        // 3. add to db
        // 4. return responses

        // photo from client side -> base64 encoded string -> decode -> store in backend -> save photo's path in db
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
        });

        const { error } = createBlogSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const { title, author, content, photo} = req.body;

        // read photo as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), 'base64')

        // allot a random name
        const imagePath = `${Date.now()}-${author}.png`;

        // save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        }
        catch(error) {
            next(error);
        }

        // save blog in db
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });

            await newBlog.save();
        }
        catch(error) {
            return next(error);
        }

        // send response
        const blogDto = new BlogDTO(newBlog);
        return res.status(201).json({blog: blogDto});
    },
    async getAll(req, res, next){
        try {
            const blogs = await Blog.find({});

            const blogsDto = [];

            for(let i=0; i < blogs.length; i++){
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto);
            }

            return res.status(200).json({blogs: blogsDto});
        }
        catch(error) {
            return next(error);
        }
    },
    async getById(req, res, next){
        // 1. validate id
        
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = getByIdSchema.validate(req.params);

        if (error){
            return next(error);
        }

        let blog;

        const { id } = req.params

        try {
            blog = await Blog.findOne({_id: id}).populate('author')
        }
        catch(error) {
            return next(error);
        }

        const blogDto = new BlogDetailsDTO(blog);

        // response
        return res.status(200).json({blog: blogDto});
    },
    async update(req, res, next){
        // validate

        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string()
        })

        const { error } = updateBlogSchema.validate(req.body);

        const {title, content, author, blogId, photo} = req.body;

        // if updating photo -> delete previous photo
        // save new photo

        let blog;
        try {
            blog = await Blog.findOne({_id: blogId})
        }
        catch(error) {
            return next(error);
        }

        if (photo) {
            let previousPhoto = blog.photoPath;

            previousPhoto = previousPhoto.split('/').at(-1);

            // delete previous photo because new photo is updated
            fs.unlinkSync(`storage/${previousPhoto}`)

            // read photo as buffer
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), 'base64')

            // allot a random name
            const imagePath = `${Date.now()}-${author}.png`;

            // save locally
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            }
            catch(error) {
                next(error);
            }

            // update blog
            await Blog.updateOne({_id: blogId}, 
                {title, content, photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`}
            );
        }
        else {
            await Blog.updateOne({_id: blogId}, {title, content});
        }

        // response
        return res.status(200).json({message: 'blog updated'});
    },
    async delete(req, res, next){
        // 1. validate id
        // 2. delete blog
        // 3. delete comments on this blog

        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = deleteBlogSchema.validate(req.params);

        const { id } = req.params;

        // delete blog and delete comments
        try {
            await Blog.deleteOne({_id: id});

            await Comment.deleteMany({blog: id});
        }
        catch(error) {
            return next(error);
        }

        // response
        return res.status(200).json({message: 'blog deleted'});
    },
}

module.exports = blogController;