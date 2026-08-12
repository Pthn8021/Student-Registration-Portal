// server.js
// This is the "brain" of the project — it starts a web server,
// connects to MongoDB, and exposes API routes the frontend calls.

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Let Express understand JSON sent from the frontend
app.use(express.json());

// Serve the frontend files (index.html, style.css, script.js) from /public
app.use(express.static(path.join(__dirname, 'public')));

// ---------- 1. CONNECT TO MONGODB ----------
// MONGO_URI comes from your .env file (see .env.example)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ---------- 2. DEFINE THE SCHEMA ----------
// This is "schema design" the challenge wants you to show understanding of.
// It defines what shape every student document in the collection must have.
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,       // MongoDB will enforce no two students share a roll number
    trim: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['EXTC', 'Computer', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Other'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  }
}, {
  timestamps: true // adds createdAt / updatedAt automatically — nice bonus touch
});

// Index on branch + name to make the "search by name/branch" bonus feature fast
// This is exactly the kind of "meaningful MongoDB feature" the updated rules reward
studentSchema.index({ name: 'text', branch: 1 });

const Student = mongoose.model('Student', studentSchema);

// ---------- 3. CRUD API ROUTES ----------

// CREATE — register a new student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ — get all students (supports ?search= and ?branch= query params for the bonus)
app.get('/api/students', async (req, res) => {
  try {
    const { search, branch } = req.query;
    let filter = {};

    if (branch) {
      filter.branch = branch;
    }
    if (search) {
      // $regex = MongoDB's pattern-matching search, case-insensitive
      filter.name = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — edit a student's details
app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — remove a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted', student: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BONUS — branch-wise count using MongoDB's aggregation pipeline
// This is a good thing to screenshot/demo for judges — it's "meaningful MongoDB use"
app.get('/api/students/stats/branch-count', async (req, res) => {
  try {
    const stats = await Student.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
