import { connect } from "mongoose";

export const connectDB = async () => {
  try {
    const password = process.env.MONGODB_PASSWORD;
    const connectionString =
      `${process.env.MONGODB_URI}${process.env.MONGODB_NAME}`.replace(
        "<password>",
        password
      );
    const connection = await connect(connectionString);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connect;
  } catch (error) {
    console.log(error.message);
  }
};
