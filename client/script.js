const apiURL = "http://localhost:3000/api/students";

async function fetchStudents() {
  const res = await fetch(apiURL);
  const students = await res.json();
  const studentList = document.getElementById("student-list");
  studentList.innerHTML = students
    .map(
      (student) => `
      <tr>
        <td>${student.name}</td>
        <td>${student.age}</td>
        <td>${student.class}</td>
        <td>${student.major}</td>
        <td>
          <button onclick="deleteStudent('${student._id}')">Xóa</button>
        </td>
      </tr>
    `
    )
    .join("");
}

async function addStudent() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const studentClass = document.getElementById("class").value;
  const major = document.getElementById("major").value;

  await fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, class: studentClass, major }),
  });

  fetchStudents();
}

async function deleteStudent(id) {
  await fetch(`${apiURL}/${id}`, { method: "DELETE" });
  fetchStudents();
}

// Load students khi trang được load
fetchStudents();
