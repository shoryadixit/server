import { APIError, APIResponse, asyncHandler } from "../utils/helpers.js";
import { uploadFile } from "../utils/uploadFile.js";
import { TagModel } from "../models/tagModel.js";
import { CarModel } from "../models/carsModel.js";

const addCar = asyncHandler(async (req, res) => {
  const { title, description, tags: inputTags } = req.body;
  const images = req.file || [];

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, description and images",
    });
  }

  console.log("Images ==> ", images);

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const upload = await uploadFile(image.path);
      console.log(upload);
      return upload?.url;
    })
  );

  const tags = await Promise.all(
    inputTags.map(async (tag) => {
      const tagName = tag.includes("#") ? tag : `#${tag}`;
      let tagRecord = await TagModel.findOne({ name: tagName });

      if (!tagRecord) {
        tagRecord = await TagModel.create({ name: tagName });
      }
      return tagRecord.id.toString();
    })
  );

  const car = await CarModel.create({
    title,
    description,
    images: imageUrls,
    tags,
    createdBy: req.user.id,
  });

  console.log(car);

  if (car) {
    return res.status(201).json({
      success: true,
      message: "Car added successfully",
      data: car,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Car not added",
    });
  }
});

const getFirstImagesFromCars = async () => {
  const cars = await CarModel.aggregate([
    {
      $project: {
        firstImage: { $arrayElemAt: ["$images", 0] },
      },
    },
  ]);
  const carImages = cars.map((car) => car.firstImage).filter(Boolean);

  return carImages;
};

const getAllCars = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "tags.name": { $regex: search, $options: "i" } },
    ],
  };

  const cars = await CarModel.aggregate([
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    },
    { $match: query },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);
  const carImages = await getFirstImagesFromCars();

  if (cars) {
    return res
      .status(200)
      .json(new APIResponse(200, "Cars fetched!", true, { cars, carImages }));
  } else {
    return res.status(400).json({
      success: false,
      message: "Cars not found",
    });
  }
});

const getCar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const car = await CarModel.findById(id).populate("tags");

  if (car) {
    return res
      .status(200)
      .json(new APIResponse(200, "Car Details fetched!", true, car));
  } else {
    return res.status(400).json(new APIError(400, "Car not found!", false));
  }
});

const deleteCar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const car = await CarModel.findByIdAndDelete(id);

  if (car) {
    return res
      .status(200)
      .json(new APIResponse(200, "Car deleted successfully!", true, {}));
  } else {
    return res.status(400).json(new APIError(400, "Car not found!", false));
  }
});

const updateCar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    tags: inputTags,
    file: previousUploadedImages,
  } = req.body;
  const images = req.file || [];

  if (!title || !description) {
    return res
      .status(400)
      .json(
        new APIError(
          400,
          "Please provide title, description and images",
          false,
          {}
        )
      );
  }
  console.log("IMages ==> ", images);

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const upload = await uploadFile(image.path);
      console.log(upload);
      return upload?.url;
    })
  );

  const tags = await Promise.all(
    inputTags.map(async (tag) => {
      const tagName = tag.includes("#") ? tag : `#${tag}`;
      let tagRecord = await TagModel.findOne({ name: tagName });

      if (!tagRecord) {
        tagRecord = await TagModel.create({ name: tagName });
      }
      return tagRecord.id.toString();
    })
  );

  const car = await CarModel.findByIdAndUpdate(id, {
    title,
    description,
    images: [...(previousUploadedImages || []), ...(imageUrls || [])].filter(
      (item) => !item.hasOwnProperty("fileBase64")
    ),
    tags,
    createdBy: req.user.id,
  });

  console.log(car);

  if (car) {
    return res
      .status(201)
      .json(new APIResponse(201, "Car updated successfully", true, {}));
  } else {
    return res
      .status(400)
      .json(new APIError(400, "Car not updated", false, {}));
  }
});

export { addCar, getAllCars, getCar, deleteCar, updateCar };
