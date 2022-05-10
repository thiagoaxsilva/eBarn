const express = require("express");
const multer = require("multer");

const Tractor = require("../models/tractor");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post("", multer({ storage: storage }).single("image"), (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(req.file);
  const tractor = new Tractor({
    name: req.body.name,
    description: req.body.description,
    imagePath: req.file
      ? url + "/images/" + req.file.filename
      : url + "/images/" + "trator-1-1651983470316.jpg",
  });

  Tractor.findOne({ name: req.body.name }).then((foundTractor) => {
    if (foundTractor) {
      return res
        .status(400)
        .json({ message: "Não é permitido cadastrar trator com o mesmo nome" });
    }
    tractor.save().then((createdTractor) => {
      return res.status(201).json({
        message: "Tractor added successfully",
        tractor: {
          ...createdTractor,
          id: createdTractor._id,
        },
      });
    });
  });
});

router.put("/:id", multer({ storage: storage }).single("image"), (req, res) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const tractor = {
    _id: req.body._id,
    name: req.body.name,
    description: req.body.description,
    imagePath: imagePath,
  };
  Tractor.updateOne({ _id: req.params.id }, tractor).then((result) => {
    res.status(200).json({ message: "Update successful" });
  });
});

router.get("", (req, res) => {
  Tractor.find().then((documents) =>
    res
      .status(200)
      .json({ message: "Tractors fetched successfully", tractors: documents })
  );
});

router.get("/:id", (req, res) => {
  Tractor.findById(req.params.id).then((tractor) => {
    if (tractor) {
      res.status(200).json(tractor);
    } else {
      res.status(404).json({ message: "Tractor not found!" });
    }
  });
});

router.delete("/:id", (req, res) => {
  Tractor.deleteOne({ _id: req.params.id }).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Tractor deleted successfully" });
  });
});

module.exports = router;
