# Student Registration Portal — Setup Guide (Beginner Friendly)

## What's in this folder
```
student-registration-portal/
├── server.js          ← backend (Node + Express + MongoDB logic)
├── package.json        ← list of libraries the project needs
├── .env.example         ← template for your MongoDB connection string
├── public/
│   ├── index.html       ← the page structure
│   ├── style.css        ← the styling
│   └── script.js        ← frontend logic (talks to the backend)
```

## Step 1 — Install Node.js
Download and install from https://nodejs.org (LTS version). This gives you `node` and `npm`
(Node's package manager) in your terminal. Check it worked:
```
node -v
npm -v
```

## Step 2 — Open the folder in VS Code
File → Open Folder → select `student-registration-portal`. Open the built-in terminal:
`Terminal → New Terminal`. Everything below runs in that terminal.

## Step 3 — Set up MongoDB Atlas (free cloud database)
You do NOT need to install MongoDB on your laptop.
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free "M0" cluster (any region close to you, e.g. Mumbai).
3. Under **Database Access**, create a database user with a username + password (save these).
4. Under **Network Access**, click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0) —
   fine for a hackathon project, not for real production apps.
5. Click **Connect** on your cluster → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

## Step 4 — Add your connection string
1. In VS Code, duplicate `.env.example` and rename the copy to `.env`.
2. Paste your real connection string into it, replacing `<username>` and `<password>` with
   the ones you created in Step 3. Keep the `/studentPortal` part — that becomes your database name.
3. `.env` is already in `.gitignore`, so it won't get pushed to GitHub by accident.

## Step 5 — Install dependencies
```
npm install
```
This reads `package.json` and downloads Express, Mongoose, and dotenv into a `node_modules` folder.

## Step 6 — Run the server
```
npm start
```
You should see:
```
✅ Connected to MongoDB
🚀 Server running at http://localhost:3000
```
If you see a MongoDB connection error instead, re-check your username/password and that you
allowed network access in Step 3.

## Step 7 — Use the app
Open http://localhost:3000 in your browser. Register a student, and you'll see it appear
in the table instantly — that data is now sitting in your MongoDB Atlas cluster. You can
verify this yourself: go to Atlas → Browse Collections → `studentPortal` database →
`students` collection, and you'll see the actual documents.

## How to divide work across 3 members
- **Member 1 — Backend/MongoDB**: owns `server.js`, the schema design, and can extend the
  aggregation stats endpoint (e.g. average year, students per branch per year).
- **Member 2 — Frontend**: owns `public/` — styling improvements, maybe adding a students-per-page
  view, form validation messages.
- **Member 3 — Demo/docs prep**: makes sure the MongoDB Atlas dashboard is ready to show live
  during judging (Browse Collections open in a tab), preps a short explanation of the schema
  and why fields are validated the way they are (`enum` for branch, `unique` for roll number) —
  this is exactly what the updated bonus criteria is scoring you on.

## What to say when judges ask "where's the MongoDB in this?"
Point to three concrete things instead of just "we used MongoDB":
1. **Schema validation** — `required`, `unique`, `enum` in `server.js` (line ~30) enforce data
   integrity at the database level, not just the frontend form.
2. **Aggregation pipeline** — the branch-count stats endpoint uses `$group` and `$sum`, a real
   MongoDB feature beyond basic CRUD.
3. **Indexed search** — the search bar uses `$regex` on an indexed `name` field, and filters by
   `branch` — show them the index in `server.js`.

## Extending for more bonus points (optional, if time allows)
- Add a `$avg` aggregation for average year across all students.
- Add pagination using `.skip()` and `.limit()` in the `/api/students` route.
- Add a compound index on `{ branch: 1, year: 1 }` if you add year-based filtering.
