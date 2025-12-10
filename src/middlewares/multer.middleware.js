import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./public/images");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./public/videos");
    } else {
      cb(null, "./public/temp"); // fallback for other file types
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // little tricky since multiple files of same name could be upload
    // but since these temp files will be upload for small time, this is alright
  },
});

export const upload = multer({ storage });
