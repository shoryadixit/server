import { multerUpload } from "../middleware/uploadFile.js";
import { Router } from "express";
import {
  addCar,
  deleteCar,
  getAllCars,
  getCar,
  updateCar,
} from "../controllers/carController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

export const carRoutes = Router();

carRoutes.route("/addCar").post(isAuthenticated, multerUpload, addCar);
carRoutes.route("/getAllCars").get(getAllCars);
carRoutes.route("/getCar/:id").get(isAuthenticated, getCar);
carRoutes.route("/deleteCar/:id").delete(isAuthenticated, deleteCar);
carRoutes.route("/updateCar/:id").put(isAuthenticated, multerUpload, updateCar);
