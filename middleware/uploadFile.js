import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../public/uploads");

export const multerUpload = (req, res, next) => {
  if ((req?.body?.file || [])?.length !== 0) {
    req?.body?.file.forEach((item) => {
      console.log(item);
      if (
        typeof item === "object" &&
        item.hasOwnProperty("fileBase64") &&
        item.hasOwnProperty("fileName")
      ) {
        const { fileBase64, fileName } = item;

        if (!fileBase64 || !fileName) {
          return res
            .status(400)
            .json({ success: false, message: "File data missing" });
        }

        const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid base64 string" });
        }

        const ext = matches[1].split("/")[1];
        const data = matches[2];

        const buffer = Buffer.from(data, "base64");
        const fileSizeInBytes = buffer.length;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        const maxSizeInMB = 1;
        if (fileSizeInMB > maxSizeInMB) {
          return res.status(400).json({
            success: false,
            message: `File size exceeds ${maxSizeInMB} MB`,
          });
        }

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const baseFileName = path.parse(fileName).name;
        const filePath = path.join(uploadDir, `${baseFileName}.${ext}`);

        fs.writeFileSync(filePath, buffer);

        req.file = [
          ...(req.file || []),
          {
            path: filePath,
            originalName: fileName,
          },
        ];
      }
    });
  }
  next();
};
