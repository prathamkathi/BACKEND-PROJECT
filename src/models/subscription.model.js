import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

/*
subscription schema working:
channels: cac, hcc, fcc
subscribers: a, b, c

this is how we save the documents:
{ ch: cac, sub: a }, { ch: cac, sub: b }, { ch: cac, sub: c }, { ch: hcc, sub: c }, { ch: fcc, sub: c },

#subscibersOfChannel: count ch
#subscriptionsOfSubscriber: count sub
*/
