const { Schema, model, Types } = require("mongoose");

const pinSchema = new Schema(
{
    user: { type: Types.ObjectId, ref: "User" },
    title: { type: String, required: true, minLength: 3, maxLength: 60 },
    description: { type: String, required: true, min: 3 },
    rating: { type: Number, required: true, min: 0, max: 5},
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    comments: [{ type: Types.ObjectId, ref: "Comment" }],
});

const PinModel = model("Pin", pinSchema);

module.exports = PinModel;
