const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS ni sozlash
app.use(cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// `uploads` katalogi mavjudligini tekshirish va uni yaratish
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB ga ulanish
mongoose.connect(
  "mongodb+srv://boburovshukurilo:g9s4rgJLwhpFLVVv@cluster0.dkb378k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Ma'lumot modeli
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
});

const Item = mongoose.model("Item", ItemSchema);

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API endpointlar
app.post("/api/items", upload.single("image"), async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : "";

  const newItem = new Item({ name, description, image });
  await newItem.save();

  res.json(newItem);
});

app.get("/", (req, res) => {
  res.send("api is working");
});

app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  await Item.findByIdAndDelete(id);
  res.json({ message: "Item deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
