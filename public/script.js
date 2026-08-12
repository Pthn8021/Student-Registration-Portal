// script.js — runs in the browser.
// It talks to our Express API using fetch(), and updates the page (DOM) with the results.

const API = '/api/students';

const form = document.getElementById('student-form');
const studentsBody = document.getElementById('students-body');
const searchInput = document.getElementById('search-input');
const filterBranch = document.getElementById('filter-branch');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

// ---------- LOAD STUDENTS (READ) ----------
async function loadStudents() {
  const search = searchInput.value.trim();
  const branch = filterBranch.value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (branch) params.append('branch', branch);

  const res = await fetch(`${API}?${params.toString()}`);
  const students = await res.json();

  studentsBody.innerHTML = '';

  if (students.length === 0) {
    studentsBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#9ca3af;">No students found</td></tr>`;
    return;
  }

  students.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.rollNumber)}</td>
      <td>${escapeHtml(s.branch)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${s.year}</td>
      <td>
        <button class="action-btn edit-btn" onclick="startEdit('${s._id}', '${escapeAttr(s.name)}', '${escapeAttr(s.rollNumber)}', '${s.branch}', '${escapeAttr(s.email)}', ${s.year})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteStudent('${s._id}')">Delete</button>
      </td>
    `;
    studentsBody.appendChild(row);
  });
}

// ---------- LOAD BRANCH STATS (aggregation bonus) ----------
async function loadStats() {
  const res = await fetch(`${API}/stats/branch-count`);
  const stats = await res.json();
  const container = document.getElementById('branch-stats');

  if (stats.length === 0) {
    container.innerHTML = `<span class="hint">No data yet</span>`;
    return;
  }

  container.innerHTML = stats.map(s => `
    <span class="stat-chip">${s._id}: ${s.count}</span>
  `).join('');
}

// ---------- CREATE / UPDATE (form submit) ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('student-id').value;
  const payload = {
    name: document.getElementById('name').value,
    rollNumber: document.getElementById('rollNumber').value,
    branch: document.getElementById('branch').value,
    email: document.getElementById('email').value,
    year: Number(document.getElementById('year').value)
  };

  const url = id ? `${API}/${id}` : API;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    alert('Error: ' + err.error);
    return;
  }

  resetForm();
  loadStudents();
  loadStats();
});

// ---------- EDIT ----------
function startEdit(id, name, rollNumber, branch, email, year) {
  document.getElementById('student-id').value = id;
  document.getElementById('name').value = name;
  document.getElementById('rollNumber').value = rollNumber;
  document.getElementById('branch').value = branch;
  document.getElementById('email').value = email;
  document.getElementById('year').value = year;

  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.style.display = 'inline-block';
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  document.getElementById('student-id').value = '';
  formTitle.textContent = 'Register a Student';
  submitBtn.textContent = 'Register Student';
  cancelEditBtn.style.display = 'none';
}

// ---------- DELETE ----------
async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadStudents();
  loadStats();
}

// ---------- SEARCH / FILTER ----------
searchInput.addEventListener('input', debounce(loadStudents, 300));
filterBranch.addEventListener('change', loadStudents);

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------- helpers to avoid breaking HTML with special characters ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

// ---------- INITIAL LOAD ----------
loadStudents();
loadStats();
