const router = require("express").Router();
const UserModel = require("../models/User.model");
const PinModel = require("../models/Pin.model");
const CommentModel = require("../models/Comment.model");

//User logged to create a pin
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const saltRounds = 10;

//Create a pin
router.post("/create-pin", isAuth, attachCurrentUser, async (req, res) => {
try {
    const loggedInUser = req.currentUser;
    const createdPin = await PinModel.create({
        ...req.body,
        user: loggedInUser._id,
    });

    await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { pinList: createdPin._id } }
    );
    return res.status(200).json(createdPin);
} catch (err) {
    console.log(err);
    return res.status(500).json(err);
}
});

// Read my pins
router.get("/my-pins", isAuth, attachCurrentUser, async (req, res) => {
    try {
    const loggedInUser = req.currentUser;
    const userPins = await PinModel.find({user: loggedInUser._id})
    return res.status(200).json(userPins);
    } catch (error) {
    console.error(error);
    return res.status(500).json(error);
    }
});

// Read details
router.get("/:pinId", isAuth, async (req, res) => {
    try {
    const { pinId } = req.params;
    const pin = await PinModel.findOne({ _id: pinId }).populate("comments");

    return res.status(200).json(pin);
    } catch (err) {
    console.log(err);
    return res.status(500).json(err);
    }
});

// Edit/update pin

router.patch("/edit/:pinId", isAuth, attachCurrentUser, async (req, res) => {
    try {
    const { pinId } = req.params;
    const loggedInUser = req.currentUser;
    const body = { ...req.body };
    delete body.pins;
    const pin = await PinModel.findOneAndUpdate({ _id: pinId });
    if (String(pin.user) !== String(loggedInUser._id)) {
        return res.status(401).json({ message: "Sorry, you can't edit a pin created by another user" });
    }  
    const editedPin = await PinModel.findOneAndUpdate(
        { _id: pinId },
        { ...body },
        { new: true, runValidators: true }
    );
    return res.status(200).json(editedPin);
    } catch (error) {
    console.log(error);
    return res.status(500).json(error);
    }
});

// Delete a pin

router.delete("/delete/:pinId", isAuth, attachCurrentUser, async (req, res) => {
    try {
        const { pinId } = req.params;
        const loggedInUser = req.currentUser;

        const pin = await PinModel.findOne({ _id: pinId });
        if (String(pin.user) !== String(loggedInUser._id)) {
        return res.status(401).json({ message: "Sorry, you can't delete a pin created by another person" });
        }

        const comments = pin.comment;

        comments.forEach(async (currentElement) => {
        if (pinId) {
            await UserModel.findOneAndUpdate(
            { _id: currentElement.user},
            { $pull: { commentList: currentElement._id } },
            { new: true, runValidators: true }
            );
        }
        });

        await CommentModel.deleteMany({ pin: pinId });

        await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $pull: { pinList: pinId } },
        { runValidators: true }
        );

        const deletedPin = await PinModel.deleteOne({_id: pinId });

        return res.status(200).json(deletedPin);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
    }
);

module.exports = router;