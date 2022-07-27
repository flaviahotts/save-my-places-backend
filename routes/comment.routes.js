const router = require("express").Router();
const UserModel = require("../models/User.model");
const PinModel = require("../models/Pin.model");
const CommentModel = require("../models/Comment.model");

//User logged to create a pin
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const saltRounds = 10;

//Create a comment
router.post("/:pinId/create-comment", isAuth, attachCurrentUser, async (req, res) => {
    try {
        const { pinId } = req.params;
        const loggedInUser = req.currentUser;
        const createdComment = await CommentModel.create({
        ...req.body,
        user: loggedInUser._id,
        pin: pinId,
        });

        await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { commentList: createdComment._id } }
        );

        await PinModel.findOneAndUpdate(
        { _id: pinId },
        { $push: { comment: createdComment._id } }
        );

        return res.status(200).json(createdComment);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
    }
);

//Read all comments
router.get("/:pinId/all-comments", async (req, res) => {
    try {
    const { commentId } = req.params;
    const allComments = await PinModel.findOne({ _id: commentId });

    return res.status(200).json(allComments);
    } catch (error) {
    console.error(error);
    return res.status(500).json(error);
    }
});

// Edit/update comment

router.patch("/edit/:commentId",  isAuth, attachCurrentUser, async (req, res) => {
    try {
    const { commentId } = req.params;
    const loggedInUser = req.currentUser;
    const comment = await CommentModel.findOne({ _id: commentId });
    const body = { ...req.body };
    const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: comment._id },
        { ...body },
        { new: true, runValidators: true });
    return res.status(200).json(updatedComment);
    } catch (error) {
    console.error(error);
    return res.status(500).json(error);
        }
    }
);

// Delete a comment

router.delete("/delete/:commentId", isAuth, attachCurrentUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const loggedInUser = req.currentUser;
        const comment = await CommentModel.findOne({ _id: commentId });
        const deletedComment = await CommentModel.deleteOne({ _id: commentId, });

        await PinModel.updateMany(
        { comment: commentId },
        { $pull: { comment: commentId } }
        );

        await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $pull: { commentList: commentId } },
        { runValidators: true }
        );

        return res.status(200).json(deletedComment);
        } catch (error) {
        console.error(error);
        return res.status(500).json(error);
        }
    }
);

module.exports = router;