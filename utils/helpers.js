class APIError {
  constructor(statusCode, message, success, error = {}) {
    this.message = message;
    this.success = success;
    this.status = statusCode;
    this.errors = error;
  }
}

class APIResponse {
  constructor(statusCode, message, success, data = {}) {
    this.message = message;
    this.success = success;
    this.status = statusCode;
    this.data = data;
  }
}

const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new APIError(500, "Internal Server Error!!!", false));
  }
};

const generateAccessToken = async (loginUser, expiresIn = "24h") => {
  try {
    let accessToken;
    accessToken = await loginUser?.generateJWTToken(expiresIn);
    loginUser.accessToken = accessToken;
    await loginUser.save({ validateBeforeSave: false });
    return accessToken;
  } catch (error) {
    console.log(error);
    throw new APIError(
      500,
      "Something went wrong while generating access token",
      false,
      error
    );
  }
};

export { APIError, APIResponse, asyncHandler, generateAccessToken };
