const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
const bodyParser = require("body-parser");
const {connectMongoDB} = require("../server/databases/mongoDb/connectMongoDB")
require("dotenv").config();
connectMongoDB();

//model student
const Student = require("./models/studentModel");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

// API thêm sinh viên
app.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).send(savedStudent);
  } catch (error) {
    res.status(400).send(error);
  }
});

// API lấy danh sách sinh viên
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).send(students);
  } catch (error) {
    res.status(500).send(error);
  }
});

// API xóa sinh viên theo ID
app.delete("/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Đã xóa sinh viên!" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
