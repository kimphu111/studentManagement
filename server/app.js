const express = require("express");
const app = express();
const PORT = 8000;
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const luxon = require("luxon");
const { DateTime } = require("luxon");
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
    const data = req.body; // Lấy dữ liệu từ request body

    // Kiểm tra nếu là mảng
    if (Array.isArray(data)) {
      const result = await Student.insertMany(data); // Lưu nhiều sinh viên
      res.status(201).json({ message: "Thêm nhiều sinh viên thành công!", data: result });
    } else {
      // Trường hợp không phải mảng (chỉ 1 sinh viên)
      const student = new Student(data); // Tạo sinh viên mới
      const result = await student.save(); // Lưu vào MongoDB
      res.status(201).json({ message: "Thêm 1 sinh viên thành công!", data: result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra!", error });
  }
});

// API lấy danh sách sinh viên
app.get("/students", async (req, res) => {
  try {
    // Lấy thông tin phân trang từ query params (nếu không có, mặc định page = 1 và limit = 10)
    const { page = 1, limit = 10 } = req.query;

    // Convert page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Lấy dữ liệu phân trang từ MongoDB
    const students = await Student.find()
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua (page - 1) * limit kết quả đầu tiên
      .limit(limitNumber); // Giới hạn số kết quả trả về

    // Đếm tổng số sinh viên để tính tổng số trang
    const totalStudents = await Student.countDocuments();

    // Trả về kết quả kèm thông tin phân trang
    res.status(200).json({
      students, // Dữ liệu sinh viên
      currentPage: pageNumber,
      totalPages: Math.ceil(totalStudents / limitNumber), // Tổng số trang
      totalStudents,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//API tìm sinh viên theo tên
app.get("/students/search", async (req, res) => {
  const { query } = req.query; // Lấy thông tin từ query

  if (!query) {
    return res.status(400).json({ message: "Điền tên sinh viên hoặc lớp!" });
  }

  try {
    // Tìm kiếm theo tất cả các trường (tên, lớp, ngành học) không phân biệt chữ hoa/chữ thường
    const students = await Student.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { age:  { $regex: query, $options: "i" } },
        { class: { $regex: query, $options: "i" } },
        { major: { $regex: query, $options: "i" } },
      ],
    });


    if (students.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên nào!" });
    }

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra khi tìm kiếm!", error });
  }
});



app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL
    const updateData = req.body; // Dữ liệu cần cập nhật từ request body

    const result = await Student.findByIdAndUpdate(id, updateData, {
      new: true, // Trả về dữ liệu sau khi cập nhật
      runValidators: true, // Kiểm tra validation khi cập nhật
    });

    if (!result) {
      return res.status(404).json({ message: "Sinh viên không tồn tại!" });
    }

    res.status(200).json({ message: "Cập nhật sinh viên thành công!", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật sinh viên!", error });
  }
});

// API xóa sinh viên theo ID
app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL
    const result = await Student.findByIdAndDelete(id); // Tìm và xóa sinh viên

    if (!result) {
      return res.status(404).json({ message: "Sinh viên không tồn tại!" });
    }

    res.status(200).json({ message: "Xóa sinh viên thành công!", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa sinh viên!", error });
  }
});


// Endpoint lấy thông tin thời tiết
app.get("/weather", async (req, res) => {
  const { city } = req.query;
  const apiKey = "6700ca38cf95d4188fe4971f9f60c25b";

  if (!city) {
    return res.status(400).send({ error: "City is required" });
  }

  console.log(`Fetching weather data for city: ${city}`); // Debug tên thành phố

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather`;
    console.log(`Calling API: ${apiUrl} with city: ${city}`); // Debug URL API

    const response = await axios.get(apiUrl, {
      params: {
        q: city,
        appid: apiKey,
        units: "metric",
      },
    });

    const timezoneOffset = response.data.timezone; 
    // console.log("Timezone Offset:", timezoneOffset);
    const localTime = DateTime.now()
      .setZone(`UTC`)
      .plus({ seconds: timezoneOffset })
      .toFormat("yyyy-MM-dd HH:mm:ss");

      // console.log(`Local Time:`, localTime);
    // console.log(`Weather API Response:`, response.data); // Debug dữ liệu từ API

    res.status(200).send({
      city: response.data.name,
      localTime,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
    });
  } catch (error) {
    console.error(`Error fetching weather data:`, error); // Debug lỗi
    if (error.response) {
      res.status(error.response.status).send({
        error: error.response.data.message,
      });
    } else {
      res.status(500).send({ error: "Something went wrong" });
    }
  }
});






app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
