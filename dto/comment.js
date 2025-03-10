class CommentDTO{
    constructor(comment){
        this._id = comment._id;
        this._createdAt = comment._createdAt;
        this.content = comment.content;
        this.authorUsername  = comment.author.username;
    }
}

module.exports = CommentDTO;