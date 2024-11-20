const mongoose = require("mongoose");

// Định nghĩa schema cho sinh viên
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  class: { type: String, required: true },
  major: { type: String, required: true },
});

// Tạo model từ schema
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
