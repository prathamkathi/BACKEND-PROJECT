import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // little tricky since multiple files of same name could be upload
    // but since these temp files will be upload for small time, this is alright
  },
});

export const upload = multer({ storage: storage });
