import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getProfile,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

export const userRoutes = Router();

userRoutes.route("/register").post(createUser);
userRoutes.route("/login").post(loginUser);
userRoutes.route("/logout").post(logoutUser);
userRoutes.route("/session").post(isAuthenticated, getProfile);
