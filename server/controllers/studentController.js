const Student = require("../models/studentModel");


// Lấy danh sách sinh viên
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm sinh viên
exports.addStudent = async (req, res) => {
  const { name, age, class: studentClass } = req.body;
  try {
    const newStudent = new Student({ name, age, class: studentClass });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sửa sinh viên
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, age, class: studentClass } = req.body;
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, age, class: studentClass },
      { new: true }
    );
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sinh viên
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await Student.findByIdAndDelete(id);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
