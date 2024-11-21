let currentPage = 1; 
const limit = 5; 

// Hàm lấy danh sách sinh viên với phân trang
async function fetchStudents(page = 1) {
  const response = await fetch(`http://localhost:8000/students?page=${page}&limit=${limit}`); 
  const data = await response.json(); // Chuyển dữ liệu về JSON

  // Hiển thị danh sách sinh viên
  const tableBody = document.getElementById('students-table');
  tableBody.innerHTML = ''; // Xóa nội dung cũ (nếu có)
  data.students.forEach(student => {
    const row = `
      <tr>
        <td>${student.name}</td>
        <td>${student.age}</td>
        <td>${student.class}</td>
        <td>${student.major}</td>
      </tr>
    `;
    tableBody.innerHTML += row; // Thêm dòng vào bảng
  });

  // Cập nhật các nút phân trang
  updatePagination(data.currentPage, data.totalPages);
}

// Hàm cập nhật các nút phân trang
function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = ''; // Xóa các nút cũ

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.className = i === currentPage ? 'active' : '';
    button.addEventListener('click', () => {
      fetchStudents(i); // Gọi lại API với trang mới
    });
    paginationContainer.appendChild(button);
  }
}

//hàm lấy thông tin thời tiết
async function getWeather() {
  const city = document.getElementById("cityInput").value; // Lấy giá trị từ input
  const resultDiv = document.getElementById("weatherResult");

  if (!city) {
    resultDiv.innerHTML = "Please enter a city name!";
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/weather?city=${city}`);
    const data = await response.json();

    if (response.ok) {
      resultDiv.innerHTML = `

        <h3>Weather in ${data.city}</h3>
        <p>Time: ${data.localTime}</p>
        <p>Temperature: ${data.temperature}°C</p>
        <p>Description: ${data.description}</p>
        <p>Humidity: ${data.humidity}%</p>
      `;
    } else {
      resultDiv.innerHTML = `<p>${data.error}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = "Failed to fetch weather data. Please try again later.";
  }
}

// Hàm tìm kiếm sinh viên theo yêu cầu
async function searchStudent() {
  const input = document.getElementById("search-input");
  const tableBody = document.getElementById("students-table");
  const query = input.value.trim();

  if (!query) {
    alert("Vui lòng nhập tên sinh viên!");
    return;
  }

  try {
    // Gọi API tìm kiếm sinh viên theo tên, age, major
    const response = await fetch(`http://localhost:8000/students/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message);
      return;
    }

    const students = await response.json();
    tableBody.innerHTML = ""; // Xóa nội dung cũ

    students.forEach(student => {
      const row = `
        <tr>
          <td>${student.name}</td>
          <td>${student.age || "Không có"}</td>
          <td>${student.class || "Không có"}</td>
          <td>${student.major || "Không có"}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    alert("Có lỗi xảy ra, vui lòng thử lại sau!");
  }
}

// Gọi hàm khi tải trang
fetchStudents(currentPage);
