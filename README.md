# CodeCraft PRO - Online Programming Teaching Platform 🚀

A modern, full-stack interactive programming education web application built with **Next.js 14**, **Express.js**, and **MongoDB (Mongoose)**.

Featuring an **in-browser code sandbox**, **automated unit test runners (JavaScript & Python)**, **interactive video & markdown lectures**, **knowledge check quizzes**, **student progress tracking & certificates**, and an **instructor studio**.

---

## 🌟 Key Features

### 1. 💻 Interactive In-Browser Code Classroom
- **Dual Language Sandbox**: Execute and evaluate **JavaScript (Node.js VM)** and **Python 3** code directly in the browser with security timeouts and captured stdout/stderr.
- **Automated Test Runners**: Evaluate student code solutions against unit test suites with visible inputs, expected vs. actual outputs, edge-case validation, and hidden test cases.
- **Problem Statement & Hints**: Step-by-step instructions with collapsible hints and algorithmic strategy tips.
- **Distraction-Free Classroom UI**: Collapsible curriculum sidebar, next/previous lesson navigation, and manual or auto-mark completion.

### 2. 📚 Structured Modular Courses & Syllabus
- **Curriculum Organization**: Courses divided into Modules and sequential Lessons.
- **Multiple Lesson Formats**:
  - 🎥 **Video Masterclasses**: Responsive 16:9 HD video playback with markdown lecture notes.
  - 📝 **Technical Articles**: Markdown reader with syntax highlighting, diagrams, and code snippets.
  - ⚡ **Coding Challenges**: Hands-on exercises with live code editors and automated test runners.
  - ❓ **Quizzes**: Interactive multiple-choice knowledge checks with immediate answer evaluation and explanations.

### 3. 🎓 Student Experience & Progress Tracking
- **Personal Dashboard**: Track overall progress across enrolled courses, view completion percentages, and resume exactly where you left off with 1 click.
- **Verified Digital Certificates**: Upon completing all lessons and passing exercises, students are awarded an official certificate of completion with a unique ID and verification link.
- **Interactive Q&A Discussion**: Post questions and reply to classmates and instructors per lesson.

### 4. 👨‍🏫 Instructor Studio & Course Authoring
- **Course Builder**: Create and publish courses with categories, difficulty levels, duration, and cover images.
- **Lesson Creator**: Add video, article, quiz, or coding challenge lessons with starter code and custom unit test cases.
- **Student Analytics**: View enrolled student counts and completion metrics.

### 5. ⚡ 1-Click Demo Switcher
- Instant switch between **Student (Sarah Miller)** and **Instructor (Alex Chen)** roles without tedious registration.

---

## 🛠️ Tech Stack Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, **Lucide Icons**, **Canvas Confetti** |
| **Backend** | **Express.js**, **Node.js**, **Mongoose (MongoDB ODM)**, **JWT Authentication**, **Bcrypt.js**, **Node VM & Child Process Sandbox** |
| **Database** | **MongoDB** (Local instance on `mongodb://127.0.0.1:27017/online_learning_platform`) |
| **Code Runner** | In-process VM sandbox for JavaScript + CLI execution for Python 3 with timeout guards |

---

## 📂 Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── models/
│   │   ├── User.js               # User schema (roles: student, instructor)
│   │   ├── Course.js             # Course schema with modules virtuals
│   │   ├── Lesson.js             # Video, article, exercise & quiz schemas
│   │   ├── Progress.js           # Student enrollment & completion tracking
│   │   ├── Submission.js         # Code submissions & test evaluations
│   │   └── Discussion.js         # Lesson Q&A thread schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth (login, register, demo-login, me)
│   │   ├── courses.js            # /api/courses (CRUD, filter, search, enroll)
│   │   ├── lessons.js            # /api/lessons (fetch, mark-complete, create)
│   │   ├── runner.js             # /api/runner (sandbox execution & test runner)
│   │   ├── submissions.js        # /api/submissions (code test evaluations)
│   │   ├── quizzes.js            # /api/quizzes (grading & explanations)
│   │   ├── progress.js           # /api/progress (student courses & certificates)
│   │   └── discussions.js        # /api/discussions (lesson Q&A)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role guard
│   │   └── errorHandler.js       # Centralized error handler
│   ├── utils/
│   │   └── codeExecutor.js       # JavaScript VM & Python runner
│   ├── seed.js                   # Pre-populates courses, lessons & demo users
│   ├── server.js                 # Express server entry point (Port 5001)
│   └── .env                      # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx        # Root Layout with AuthProvider & Navbar
│   │   │   ├── page.jsx          # Landing page with live playground demo
│   │   │   ├── courses/          # Course catalog & search
│   │   │   │   ├── page.jsx      # Filterable courses directory
│   │   │   │   └── [slug]/       # Detailed syllabus & enrollment page
│   │   │   ├── learn/
│   │   │   │   └── [courseSlug]/[lessonId]/ # Interactive Classroom IDE
│   │   │   ├── dashboard/        # Student dashboard & progress tracking
│   │   │   ├── instructor/       # Instructor Studio & lesson builder
│   │   │   ├── certificate/      # Digital certificate verification page
│   │   │   ├── login/            # Login with 1-click demo access
│   │   │   └── register/         # Student/Instructor registration
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with demo selector
│   │   │   ├── Footer.jsx        # Modern dark footer
│   │   │   ├── CodeEditor.jsx    # Syntax indentation & multi-line editor
│   │   │   ├── ConsoleOutput.jsx # Interactive terminal & test results tabs
│   │   │   ├── CourseCard.jsx    # Course card with progress bar
│   │   │   └── QuizRunner.jsx    # Multiple choice quiz component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Client auth & demo session state
│   │   └── lib/
│   │       └── api.js            # Fetch client with auth headers
│   ├── next.config.js            # Next.js config with API proxy rewrites
│   ├── tailwind.config.js        # Custom developer theme palette
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`
- **Python 3**: For executing Python exercises (`python3`)

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js    # Seeds courses, lessons, and demo users
node server.js  # Starts Express server on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts Next.js on http://localhost:3000
```

---

## 🔑 Demo Accounts

Use the **Demo Role Switcher** in the top navigation bar or log in with:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@codecraft.dev` | `password123` |
| **Instructor** | `instructor@codecraft.dev` | `password123` |

---

## 🌐 Application URLs

- **Frontend Home**: [http://localhost:3000](http://localhost:3000)
- **Course Catalog**: [http://localhost:3000/courses](http://localhost:3000/courses)
- **Student Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Instructor Studio**: [http://localhost:3000/instructor](http://localhost:3000/instructor)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
