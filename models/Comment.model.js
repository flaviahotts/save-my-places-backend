const { Schema, model, Types } = require("mongoose");

const commentSchema = new Schema({
    user: { type: Types.ObjectId, ref: "User"},
    comment: { type: String, required: true, minLength: 2 },
    creationDate: { type: Date, default: Date.now() },
    pin: { type: Types.ObjectId, ref: "Pin" },
});

const CommentModel = model("Comment", commentSchema);

module.exports = CommentModel;
