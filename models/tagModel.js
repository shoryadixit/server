import {model, Schema} from "mongoose";

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TagModel = model("Tag", tagSchema);
