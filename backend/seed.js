const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Progress = require('./models/Progress');

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_learning_platform';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Progress.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Instructor & Student Users
    const instructor = await User.create({
      name: 'Alex Chen',
      email: 'instructor@codecraft.dev',
      password: 'password123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Staff Software Architect & Course Author with 12+ years building distributed web applications and teaching millions of developers.',
    });

    const student = await User.create({
      name: 'Sarah Miller',
      email: 'student@codecraft.dev',
      password: 'password123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      bio: 'Enthusiastic front-end developer eager to master full-stack and algorithms.',
    });

    console.log('Created Users: instructor@codecraft.dev & student@codecraft.dev (password: password123)');

    // 2. Course 1: Modern JavaScript & Full-Stack Foundations
    const courseJS = await Course.create({
      title: 'Modern JavaScript & Full-Stack Foundations',
      slug: 'modern-javascript-fullstack-foundations',
      tagline: 'Master ES6+, closures, async programming, and modern full-stack web concepts with hands-on coding challenges.',
      description: 'Comprehensive, deep-dive curriculum crafted for developers wanting to go beyond the basics. You will master JavaScript execution context, closures, event loop microtasks, async/await, functional paradigms, and write code that powers modern web applications.',
      instructor: instructor._id,
      category: 'Web Development',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=60',
      price: 0,
      rating: 4.9,
      ratingCount: 340,
      studentsCount: 1420,
      estimatedHours: 18,
      tags: ['JavaScript', 'ES6+', 'Frontend', 'Async/Await', 'FullStack'],
      syllabusOverview: [
        'Execution Context, Scopes & Lexical Environments',
        'Closures and Higher-Order Functions',
        'Asynchronous JS, Promises & Event Loop Architecture',
        'Interactive Coding Challenges with Live Automated Tests',
      ],
    });

    // Lessons for Course 1
    const lessonJS1 = await Lesson.create({
      course: courseJS._id,
      moduleTitle: 'Module 1: Language Foundations & ES6+',
      title: 'Understanding Scope, Hoisting & Closures',
      slug: 'scope-hoisting-closures',
      order: 1,
      type: 'video',
      duration: '14 min',
      videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ',
      content: `## Welcome to Modern JavaScript Architecture!

In this lesson, we explore how JavaScript handles variables, lexical environments, and execution contexts.

### Key Concepts:
1. **Lexical Scope**: Scope is determined at compile-time by where variables and blocks are declared.
2. **Hoisting**: Variable and function declarations are put into memory during the creation phase before execution.
3. **Closures**: An inner function remembers variables from its lexical environment even after the outer function has completed execution.

\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getValue());   // 11
\`\`\`

### Practical Applications
Closures power data privacy (encapsulation), memoization, currying, and event listener handlers in modern frontend frameworks like React!`,
    });

    const lessonJS2 = await Lesson.create({
      course: courseJS._id,
      moduleTitle: 'Module 1: Language Foundations & ES6+',
      title: 'Coding Exercise: Two Sum Challenge',
      slug: 'coding-exercise-two-sum',
      order: 2,
      type: 'exercise',
      duration: '20 min',
      content: `### Exercise: Two Sum

Write a function \`twoSum(nums, target)\` that takes an array of integers \`nums\` and an integer \`target\`.
Return an array of the **indices** of the two numbers such that they add up to \`target\`.

- Each input will have exactly one solution.
- You may not use the same element twice.
- You can return the answer in any order (indices formatted as an array \`[index1, index2]\`).

#### Example:
\`\`\`javascript
twoSum([2, 7, 11, 15], 9); // returns [0, 1]
twoSum([3, 2, 4], 6);       // returns [1, 2]
\`\`\``,
      exercise: {
        language: 'javascript',
        instructions: 'Implement the function twoSum(nums, target) that returns the pair of indices whose values sum to target.',
        starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here:
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        hints: [
          'Consider using a Hash Map to store numbers you have seen and their index.',
          'For each number x, check if (target - x) already exists in your map.',
        ],
        testCases: [
          {
            description: 'Simple pair sum to 9',
            input: 'twoSum([2, 7, 11, 15], 9)',
            expectedOutput: '[0,1]',
            isHidden: false,
          },
          {
            description: 'Indices not starting at zero',
            input: 'twoSum([3, 2, 4], 6)',
            expectedOutput: '[1,2]',
            isHidden: false,
          },
          {
            description: 'Identical numbers sum',
            input: 'twoSum([3, 3], 6)',
            expectedOutput: '[0,1]',
            isHidden: false,
          },
          {
            description: 'Negative numbers in array',
            input: 'twoSum([-1, -2, -3, -4, -5], -8)',
            expectedOutput: '[2,4]',
            isHidden: true,
          },
        ],
      },
    });

    const lessonJS3 = await Lesson.create({
      course: courseJS._id,
      moduleTitle: 'Module 1: Language Foundations & ES6+',
      title: 'Quiz: JavaScript Scope & Closures Check',
      slug: 'quiz-js-scope-check',
      order: 3,
      type: 'quiz',
      duration: '10 min',
      content: 'Test your understanding of JavaScript execution contexts, variable declarations, and lexical closures.',
      quiz: [
        {
          question: 'What is the output of `typeof (function() {})()` when executed?',
          options: ['"function"', '"undefined"', '"object"', '"null"'],
          correctAnswerIndex: 1,
          explanation: 'Since the immediately invoked function expression does not return a value, its evaluated result is undefined, whose typeof is "undefined".',
        },
        {
          question: 'Which of the following is true about `const` in JavaScript?',
          options: [
            'It makes objects immutable so properties cannot be changed.',
            'It creates an immutable binding; the variable identifier cannot be reassigned.',
            'It is function-scoped like `var`.',
            'It is hoisted and initialized to `undefined`.',
          ],
          correctAnswerIndex: 1,
          explanation: 'const creates a block-scoped constant reference. While the identifier cannot be reassigned, properties of objects declared with const can still be modified.',
        },
        {
          question: 'What constitutes a closure in JavaScript?',
          options: [
            'A function bundled with references to its surrounding state (lexical environment)',
            'Any asynchronous callback passed to setTimeout',
            'A function that terminates immediately upon calling',
            'A strictly typed method in an ES6 class',
          ],
          correctAnswerIndex: 0,
          explanation: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
        },
      ],
    });

    const lessonJS4 = await Lesson.create({
      course: courseJS._id,
      moduleTitle: 'Module 2: Asynchronous Programming & Event Loop',
      title: 'Promises, Async/Await and the Microtask Queue',
      slug: 'promises-async-await-microtasks',
      order: 4,
      type: 'article',
      duration: '15 min',
      content: `## Deep Dive into the JavaScript Event Loop

JavaScript is single-threaded, but non-blocking I/O is achieved through the concurrency model governed by the **Event Loop**.

### Execution Order Priority
1. **Call Stack**: Executes synchronous code line by line.
2. **Microtask Queue**: Promises (\`.then\`, \`.catch\`, \`await\`), \`queueMicrotask\`, \`MutationObserver\`. Microtasks execute immediately after the current script executes, before any macrotasks!
3. **Macrotask Queue**: \`setTimeout\`, \`setInterval\`, \`setImmediate\`, I/O operations.

\`\`\`javascript
console.log('1: Sync Start');

setTimeout(() => {
  console.log('4: Macro Task (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Micro Task (Promise)');
});

console.log('2: Sync End');

// Order of logs:
// 1: Sync Start
// 2: Sync End
// 3: Micro Task (Promise)
// 4: Macro Task (setTimeout)
\`\`\`

### Error Handling with Async/Await
Always wrap asynchronous operations in \`try/catch\` blocks to catch rejections gracefully:

\`\`\`javascript
async function fetchCourseData(courseId) {
  try {
    const res = await fetch(\`/api/courses/\${courseId}\`);
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    console.error('Failed to load course:', err.message);
    throw err;
  }
}
\`\`\``,
    });

    const lessonJS5 = await Lesson.create({
      course: courseJS._id,
      moduleTitle: 'Module 2: Asynchronous Programming & Event Loop',
      title: 'Coding Exercise: Array Transformation (Custom Reduce)',
      slug: 'coding-exercise-custom-reduce',
      order: 5,
      type: 'exercise',
      duration: '25 min',
      content: `### Exercise: Implement Array Accumulator

Implement a function \`accumulate(arr, callback, initialValue)\` that mimics \`Array.prototype.reduce\`.
It processes each element of the array \`arr\` in order, passing the accumulator value and current item to the callback.

\`\`\`javascript
accumulate([1, 2, 3, 4], (sum, n) => sum + n, 0); // returns 10
accumulate(['a', 'b', 'c'], (str, char) => str + char, ''); // returns "abc"
\`\`\``,
      exercise: {
        language: 'javascript',
        instructions: 'Write the accumulate(arr, callback, initialValue) function that reduces an array into a single accumulated result.',
        starterCode: `/**
 * @param {Array} arr
 * @param {Function} callback
 * @param {*} initialValue
 * @return {*}
 */
function accumulate(arr, callback, initialValue) {
  let acc = initialValue !== undefined ? initialValue : arr[0];
  const startIdx = initialValue !== undefined ? 0 : 1;

  for (let i = startIdx; i < arr.length; i++) {
    acc = callback(acc, arr[i], i);
  }

  return acc;
}`,
        solutionCode: `function accumulate(arr, callback, initialValue) {
  let acc = initialValue !== undefined ? initialValue : arr[0];
  const startIdx = initialValue !== undefined ? 0 : 1;
  for (let i = startIdx; i < arr.length; i++) {
    acc = callback(acc, arr[i], i);
  }
  return acc;
}`,
        hints: [
          'If initialValue is provided, start iteration at index 0 with acc = initialValue.',
          'If initialValue is undefined, use arr[0] as acc and start loop at index 1.',
        ],
        testCases: [
          {
            description: 'Sum numbers with initialValue 0',
            input: 'accumulate([1, 2, 3, 4], (a, b) => a + b, 0)',
            expectedOutput: '10',
            isHidden: false,
          },
          {
            description: 'Multiply elements',
            input: 'accumulate([2, 3, 4], (a, b) => a * b, 1)',
            expectedOutput: '24',
            isHidden: false,
          },
          {
            description: 'Concatenate strings',
            input: 'accumulate(["Hello", " ", "World"], (a, b) => a + b, "")',
            expectedOutput: '"Hello World"',
            isHidden: false,
          },
        ],
      },
    });

    // 3. Course 2: Python & Data Structures Mastery
    const coursePy = await Course.create({
      title: 'Python & Data Structures Mastery',
      slug: 'python-data-structures-mastery',
      tagline: 'Write idiomatic Python and master fundamental data structures like stacks, queues, hash tables, and graphs.',
      description: 'Learn Python from first principles up to building robust, algorithmic data structures. Ideal for technical interview prep and writing high-performance backend pipelines.',
      instructor: instructor._id,
      category: 'Python & Data',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60',
      price: 0,
      rating: 4.95,
      ratingCount: 280,
      studentsCount: 960,
      estimatedHours: 24,
      tags: ['Python', 'DataStructures', 'Algorithms', 'Backend', 'Interviews'],
      syllabusOverview: [
        'Pythonic Idioms, List Comprehensions & Generators',
        'Time & Space Complexity in Python Built-ins',
        'Stacks, Queues, and Priority Queues',
        'Hash Maps, Dictionaries, and Graph Traversals',
      ],
    });

    const lessonPy1 = await Lesson.create({
      course: coursePy._id,
      moduleTitle: 'Module 1: Pythonic Idioms & Core Data Types',
      title: 'Pythonic Syntax: List Comprehensions, Tuples & Slicing',
      slug: 'pythonic-syntax-idioms',
      order: 1,
      type: 'video',
      duration: '16 min',
      videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
      content: `## Writing Clean, Pythonic Code

Python values readability, simplicity, and expressive constructs.

### List Comprehensions vs Loops
Instead of allocating an empty list and calling \`.append()\`:

\`\`\`python
# Imperative style:
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x**2)

# Pythonic style:
squares = [x**2 for x in range(10) if x % 2 == 0]
\`\`\`

### Dictionary Comprehensions
\`\`\`python
names = ['Alice', 'Bob', 'Charlie']
length_map = {name: len(name) for name in names}
# {'Alice': 5, 'Bob': 3, 'Charlie': 7}
\`\`\``,
    });

    const lessonPy2 = await Lesson.create({
      course: coursePy._id,
      moduleTitle: 'Module 1: Pythonic Idioms & Core Data Types',
      title: 'Coding Exercise: Palindrome & Anagram Verifier',
      slug: 'python-palindrome-verifier',
      order: 2,
      type: 'exercise',
      duration: '18 min',
      content: `### Exercise: Is Valid Palindrome

Write a Python function \`is_palindrome(s: str) -> bool\` that determines if a given string is a palindrome, considering only alphanumeric characters and ignoring cases.

#### Example:
- \`is_palindrome("A man, a plan, a canal: Panama")\` -> \`True\`
- \`is_palindrome("race a car")\` -> \`False\``,
      exercise: {
        language: 'python',
        instructions: 'Define the is_palindrome(s) function in Python that returns True or False.',
        starterCode: `def is_palindrome(s: str) -> bool:
    # Filter to only alphanumeric and lowercase
    filtered = [ch.lower() for ch in s if ch.isalnum()]
    return filtered == filtered[::-1]
`,
        solutionCode: `def is_palindrome(s: str) -> bool:
    filtered = [ch.lower() for ch in s if ch.isalnum()]
    return filtered == filtered[::-1]
`,
        hints: [
          'Use str.isalnum() to check if a character is a letter or number.',
          'Use Python slice notation [::-1] to reverse the sequence.',
        ],
        testCases: [
          {
            description: 'Classic Panama palindrome',
            input: 'is_palindrome("A man, a plan, a canal: Panama")',
            expectedOutput: 'True',
            isHidden: false,
          },
          {
            description: 'Non-palindrome string',
            input: 'is_palindrome("race a car")',
            expectedOutput: 'False',
            isHidden: false,
          },
          {
            description: 'Empty or single whitespace string',
            input: 'is_palindrome("   ")',
            expectedOutput: 'True',
            isHidden: false,
          },
          {
            description: 'Special characters and punctuation',
            input: 'is_palindrome("Was it a car or a cat I saw?")',
            expectedOutput: 'True',
            isHidden: true,
          },
        ],
      },
    });

    const lessonPy3 = await Lesson.create({
      course: coursePy._id,
      moduleTitle: 'Module 1: Pythonic Idioms & Core Data Types',
      title: 'Quiz: Python Data Structures & Complexity',
      slug: 'quiz-python-complexity',
      order: 3,
      type: 'quiz',
      duration: '12 min',
      content: 'Assess your knowledge of Python collections and time complexities.',
      quiz: [
        {
          question: 'What is the average time complexity of checking membership `x in d` in a Python dictionary?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctAnswerIndex: 0,
          explanation: 'Python dictionaries are implemented as hash tables, making key lookup and membership testing O(1) on average.',
        },
        {
          question: 'What is the main difference between a Python list and a Python tuple?',
          options: [
            'Lists can contain mixed data types while tuples cannot',
            'Tuples are immutable while lists are mutable',
            'Lists use hash tables internally while tuples use linked lists',
            'Tuples can only store numbers',
          ],
          correctAnswerIndex: 1,
          explanation: 'Tuples are immutable sequences in Python; once defined, their elements cannot be added, removed, or replaced.',
        },
        {
          question: 'What does `collections.deque` provide that makes it superior to `list` for queue implementations?',
          options: [
            'Automatic multi-threading synchronization',
            'O(1) appends and pops from both ends (left and right)',
            'Unlimited memory expansion',
            'Zero memory overhead compared to tuples',
          ],
          correctAnswerIndex: 1,
          explanation: 'A deque (double-ended queue) provides O(1) appends and pops from either end, unlike list.pop(0) which is O(n).',
        },
      ],
    });

    // 4. Enroll student in Course 1 with partial progress
    student.enrolledCourses.push({
      course: courseJS._id,
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });
    student.enrolledCourses.push({
      course: coursePy._id,
      enrolledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });
    await student.save();

    // Create progress for Sarah in Course 1: Lesson 1 & 2 completed
    await Progress.create({
      user: student._id,
      course: courseJS._id,
      completedLessons: [lessonJS1._id, lessonJS2._id],
      lastAccessedLesson: lessonJS3._id,
      completionPercentage: 40,
      isCompleted: false,
    });

    // Create progress for Sarah in Course 2: Lesson 1 completed
    await Progress.create({
      user: student._id,
      course: coursePy._id,
      completedLessons: [lessonPy1._id],
      lastAccessedLesson: lessonPy2._id,
      completionPercentage: 33,
      isCompleted: false,
    });

    console.log('Seeded courses and initial student progress successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
