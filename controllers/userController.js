import {UserModel} from "../models/userModel.js";
import {APIError, APIResponse, asyncHandler, generateAccessToken} from "../utils/helpers.js";

const createUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    const userExists = await UserModel.findOne({
        email,
    });
    if (userExists) {
        return res
            .status(400)
            .json(new APIError(400, "User already exists!", false, {}));
    }
    const user = await UserModel.create({
        name, email, password,
    });

    if (user) {
        return res
            .status(201)
            .json(new APIResponse(201, "User created successfully!", true, {}));
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json(new APIError(400, "Please provide an email and password!", false, {}));
    }

    const user = await UserModel.findOne({
        email,
    });
    if (user && (await user.isPasswordValid(password))) {
        req.session.token = await generateAccessToken(user);
        return res.status(200).json(new APIResponse(200, "Login successful!", true, {}));
    } else {
        return res
            .status(401)
            .json(new APIError(401, "Invalid email or password!", false, {}));
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    // req.session.destroy((err) => {
    //     if (err) {
    //         return res
    //             .status(400)
    //             .json(new APIError(400, "Error logging out!", false, {}));
    //     }
    //     return res.status(200).json(new APIResponse(200, "Logged out successfully!", true, {}));
    // });

    try {
        req.session.destroy();
        res.clearCookie('connect.sid');
        return res.status(200).json({message: "Logged out successfully"});

    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something broke!"});
    }


});

const getProfile = asyncHandler(async (req, res) => {
    const decodedUser = req.user;
    const user = await UserModel.findById(decodedUser.id).select("-password -__v -createdAt -updatedAt -cars");
    console.log(user);
    if (user) {
        return res.status(200).json(new APIResponse(200, "User profile fetched successfully!", true, user));
    } else {
        return res.status(404).json(new APIError(404, "User not found!", false, {}));
    }
});
export {createUser, loginUser, logoutUser, getProfile};
