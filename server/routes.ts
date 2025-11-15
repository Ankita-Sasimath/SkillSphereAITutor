import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "");

// Use latest Gemini model names - gemini-2.5-flash is faster and cheaper
// gemini-2.5-pro is more capable but slower
const DEFAULT_MODEL = "gemini-2.5-flash";

// Helper function to convert OpenAI-style messages to Gemini format
function convertMessagesToGemini(messages: Array<{ role: string; content: string }>) {
  // Gemini uses a different format - we need to combine system and user messages
  let systemInstruction = "";
  const conversationHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  
  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = msg.content;
    } else if (msg.role === "user") {
      conversationHistory.push({ role: "user", parts: [{ text: msg.content }] });
    } else if (msg.role === "assistant") {
      conversationHistory.push({ role: "model", parts: [{ text: msg.content }] });
    }
  }
  
  return { systemInstruction, conversationHistory };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { username, email, fullName, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password with cost factor of 10 (secure default)
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        email,
        fullName: fullName || null,
        password: hashedPassword,
        selectedDomains: []
      });

      res.json({ 
        userId: user.id, 
        username: user.username,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ 
        userId: user.id, 
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        selectedDomains: user.selectedDomains
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.get("/api/auth/check", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(401).json({ authenticated: false });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({ 
      authenticated: true,
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      selectedDomains: user.selectedDomains
    });
  });

  // Get user profile
  app.get("/api/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        selectedDomains: user.selectedDomains
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch("/api/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { fullName, email } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUser(userId, {
        fullName: fullName || user.fullName,
        email: email || user.email
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Update user domains after onboarding (user must be authenticated)
  app.post("/api/user/onboard", async (req: Request, res: Response) => {
    try {
      const { userId, domains } = req.body;
      
      if (!userId || !domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: "User ID and domains are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUserDomains(userId, domains);

      res.json({ 
        userId: user.id, 
        username: user.username,
        selectedDomains: domains
      });
    } catch (error) {
      console.error("Error onboarding user:", error);
      res.status(500).json({ error: "Failed to onboard user" });
    }
  });

  // Fallback quiz in case AI generation fails - with randomization for unique questions
  const getFallbackQuiz = (domain: string) => {
    // Multiple question banks to ensure variety
    const questionBanks = [
      [
        {
          question: `What is the primary purpose of ${domain}?`,
          options: [
            "To build software applications",
            "To manage data and information",
            "To solve specific technical problems",
            "All of the above"
          ],
          correctAnswer: 3
        },
        {
          question: `Which skill is most important for ${domain}?`,
          options: [
            "Problem-solving abilities",
            "Communication skills",
            "Technical knowledge",
            "All are equally important"
          ],
          correctAnswer: 3
        },
        {
          question: `${domain} is best described as:`,
          options: [
            "A theoretical field",
            "A practical discipline",
            "Both theoretical and practical",
            "Neither theoretical nor practical"
          ],
          correctAnswer: 2
        },
        {
          question: `What is a common tool used in ${domain}?`,
          options: [
            "Specialized software",
            "Programming languages",
            "Development frameworks",
            "Varies by specific application"
          ],
          correctAnswer: 3
        },
        {
          question: `How would you rate the learning curve for ${domain}?`,
          options: [
            "Very easy",
            "Moderate",
            "Challenging but manageable",
            "Very difficult"
          ],
          correctAnswer: 2
        }
      ],
      [
        {
          question: `Which approach is most effective for learning ${domain}?`,
          options: [
            "Reading documentation only",
            "Hands-on practice and projects",
            "Watching video tutorials",
            "Attending workshops"
          ],
          correctAnswer: 1
        },
        {
          question: `What role does ${domain} play in modern technology?`,
          options: [
            "It's becoming obsolete",
            "It's essential and growing",
            "It's only for specialists",
            "It's mainly theoretical"
          ],
          correctAnswer: 1
        },
        {
          question: `How often should you practice ${domain} skills?`,
          options: [
            "Once a month",
            "Once a week",
            "Daily or several times per week",
            "Only when working on projects"
          ],
          correctAnswer: 2
        },
        {
          question: `What's the best way to stay current in ${domain}?`,
          options: [
            "Follow industry blogs and forums",
            "Take regular courses",
            "Work on real projects",
            "All of the above"
          ],
          correctAnswer: 3
        },
        {
          question: `${domain} expertise requires:`,
          options: [
            "Natural talent only",
            "Consistent practice and learning",
            "Expensive equipment",
            "A computer science degree"
          ],
          correctAnswer: 1
        }
      ]
    ];
    
    // Mix questions from both banks for maximum variety
    const allQuestions = [...questionBanks[0], ...questionBanks[1]];
    
    // Shuffle all questions using timestamp-based seed for better randomization
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    
    // Select 5 random questions from the shuffled pool
    const selectedQuestions = shuffled.slice(0, 5);
    
    return {
      domain,
      questions: selectedQuestions
    };
  };

  // Generate quiz based on selected domains
  app.post("/api/quiz/generate", async (req: Request, res: Response) => {
    try {
      const { domains, userId } = req.body;
      
      if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(400).json({ error: "Domains are required" });
      }

      const domain = domains[0]; // Generate quiz for first domain
      
      try {
        // Add timestamp to ensure unique quiz generation for each user
        const uniqueSeed = `${userId}-${Date.now()}`;
        
        const prompt = `Generate a UNIQUE skill assessment quiz for ${domain}. 
        User ID: ${uniqueSeed}
        
        Create 10 DIFFERENT multiple choice questions that progressively test knowledge from beginner to advanced level.
        Ensure questions are varied and not repetitive across different quiz attempts.
        Include questions covering:
        - Fundamental concepts (questions 1-3)
        - Intermediate topics (questions 4-7)  
        - Advanced techniques (questions 8-10)
        
        Vary the question types:
        - Conceptual understanding
        - Practical application
        - Problem-solving scenarios
        - Best practices
        - Common pitfalls
        
        Return ONLY valid JSON in this exact format:
        {
          "questions": [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0
            }
          ]
        }`;

        const model = genAI.getGenerativeModel({ 
          model: DEFAULT_MODEL,
          generationConfig: {
            temperature: 0.9,
            responseMimeType: "application/json",
          },
          systemInstruction: "You are a skill assessment expert. Generate accurate, well-structured, and UNIQUE quizzes in valid JSON format only. Never repeat questions from previous quizzes."
        });

        const result = await model.generateContent(prompt);
        const content = result.response.text() || "{}";
        const quizData = JSON.parse(content);
        
        // Validate quiz structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          console.log("Invalid quiz structure from Gemini, using fallback");
          return res.json(getFallbackQuiz(domain));
        }
        
        res.json({ 
          domain,
          questions: quizData.questions
        });
      } catch (aiError) {
        console.error("Gemini quiz generation failed, using fallback:", aiError);
        res.json(getFallbackQuiz(domain));
      }
    } catch (error) {
      console.error("Error in quiz generation endpoint:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Submit quiz and determine skill level
  app.post("/api/quiz/submit", async (req: Request, res: Response) => {
    try {
      const { userId, domain, questions, answers } = req.body;
      
      if (!userId || !domain || !questions || !answers) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      // Verify user exists, create if needed (failsafe)
      let user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found, creating demo user...");
        user = await storage.createUser({
          username: `demo-user-${Date.now()}`,
          email: `demo-user-${Date.now()}@example.com`,
          password: 'demo',
          selectedDomains: [domain]
        });
      }

      // Calculate score
      let score = 0;
      questions.forEach((q: any, idx: number) => {
        if (q.correctAnswer === answers[idx]) {
          score++;
        }
      });

      const totalQuestions = questions.length;
      const percentage = (score / totalQuestions) * 100;
      
      // Determine skill level based on score
      let skillLevel = "Beginner";
      if (percentage >= 70) {
        skillLevel = "Advanced";
      } else if (percentage >= 40) {
        skillLevel = "Intermediate";
      }

      // Save quiz attempt
      const attempt = await storage.saveQuizAttempt({
        userId: user.id,
        domain,
        questions,
        answers,
        score,
        totalQuestions,
        skillLevelDetermined: skillLevel
      });

      // Save skill level for domain
      await storage.setDomainSkillLevel(user.id, domain, skillLevel);

      // Prepare detailed results
      const detailedResults = questions.map((q: any, idx: number) => ({
        question: q.question,
        options: q.options,
        userAnswer: answers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect: q.correctAnswer === answers[idx]
      }));

      res.json({
        score,
        totalQuestions,
        percentage,
        skillLevel,
        attemptId: attempt.id,
        results: detailedResults
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // Get user skill levels
  app.get("/api/user/:userId/skills", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const skills = await storage.getUserSkillLevels(userId);
      // Transform to domain -> skill level mapping
      const skillMap = skills.reduce((acc: Record<string, string>, skill) => {
        acc[skill.domain] = skill.skillLevel;
        return acc;
      }, {});
      res.json(skillMap);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

  // Get quiz history for a user
  app.get("/api/quiz/history", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const attempts = await storage.getUserQuizAttempts(userId);
      
      // Format the quiz history
      const quizHistory = attempts.map((attempt: any) => ({
        id: attempt.id,
        domain: attempt.domain,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
        skillLevel: attempt.skillLevelDetermined,
        createdAt: attempt.createdAt
      }));

      res.json(quizHistory);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ error: "Failed to fetch quiz history" });
    }
  });

  // Get course recommendations
  app.post("/api/courses/recommend", async (req: Request, res: Response) => {
    try {
      const { domain, skillLevel } = req.body;
      
      if (!domain || !skillLevel) {
        return res.status(400).json({ error: "Domain and skill level are required" });
      }

      const prompt = `Recommend 6 high-quality courses for learning ${domain} at ${skillLevel} level.
      Include a mix of FREE and paid options, with preference for free courses.
      
      For each course provide:
      - title: Course name
      - platform: Platform name (Coursera, freeCodeCamp, YouTube, Udemy, etc.)
      - url: Direct course URL
      - isPaid: true/false
      - description: Brief course description (max 100 characters)
      - skillLevel: ${skillLevel}
      
      Return ONLY valid JSON:
      {
        "courses": [
          {
            "title": "Course Title",
            "platform": "Platform Name",
            "url": "https://...",
            "isPaid": false,
            "description": "Brief description",
            "skillLevel": "${skillLevel}"
          }
        ]
      }`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
        temperature: 0.8,
          responseMimeType: "application/json",
        },
        systemInstruction: "You are a learning path expert. Recommend real, high-quality courses from reputable platforms."
      });

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text() || "{}");
      
      res.json({ courses: data.courses || [] });
    } catch (error) {
      console.error("Error recommending courses:", error);
      res.status(500).json({ error: "Failed to recommend courses" });
    }
  });


  // Get user's enrolled courses
  app.get("/api/user/:userId/courses", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const courses = await storage.getUserCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Update course progress
  app.patch("/api/courses/:courseId/progress", async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ error: "Invalid progress value" });
      }

      if (progress === 100) {
        await storage.completeCourse(courseId);
      } else {
        await storage.updateCourseProgress(courseId, progress);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });


  // Get chat history
  app.get("/api/user/:userId/chat-history", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getUserChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Create learning schedule
  app.post("/api/schedule", async (req: Request, res: Response) => {
    try {
      const { userId, courseId, title, description, dueDate } = req.body;
      
      if (!userId || !title) {
        return res.status(400).json({ error: "User ID and title are required" });
      }

      const schedule = await storage.createSchedule({
        userId,
        courseId: courseId || null,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false
      });

      res.json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  // Get user schedules
  app.get("/api/user/:userId/schedules", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const schedules = await storage.getUserSchedules(userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  // Update schedule completion
  app.patch("/api/schedule/:scheduleId", async (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const { completed } = req.body;
      
      await storage.updateScheduleCompletion(scheduleId, completed);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  // Get course recommendations for user
  app.get("/api/courses/recommendations/:userId/:domain?", async (req: Request, res: Response) => {
    try {
      const { userId, domain } = req.params;
      
      // Get user skill levels to provide better recommendations
      const skillLevels = await storage.getUserSkillLevels(userId);
      
      // If domain specified, filter to that domain
      const targetDomain = domain || (skillLevels.length > 0 ? skillLevels[0].domain : 'Web Development');
      const skillLevel = skillLevels.find(s => s.domain === targetDomain)?.skillLevel || 'Beginner';
      
      // Generate course recommendations using AI
      try {
        const prompt = `You are recommending REAL courses for learning ${targetDomain} at ${skillLevel} level.
        
        CRITICAL: URLs MUST be SPECIFIC COURSE PAGES, NOT platform homepages!
        
        VALID URL examples:
        ✅ YouTube: "https://www.youtube.com/watch?v=zJSY8tbf_ys" (specific video)
        ✅ Coursera: "https://www.coursera.org/learn/machine-learning" (specific course)
        ✅ Udemy: "https://www.udemy.com/course/react-the-complete-guide" (specific course)
        ✅ freeCodeCamp: "https://www.freecodecamp.org/learn/responsive-web-design" (specific certification)
        
        INVALID URL examples (DO NOT USE):
        ❌ "https://www.youtube.com" (homepage)
        ❌ "https://www.coursera.org" (homepage)
        ❌ "https://www.udemy.com" (homepage)
        
        Recommend 9 courses with AT LEAST 6 free options.
        
        For each course:
        - id: unique identifier (e.g., "web-dev-yt-1")
        - title: Real course name (e.g., "HTML CSS JavaScript Full Course 2024")
        - provider: Platform name (YouTube, Coursera, freeCodeCamp, Udemy, edX, Khan Academy)
        - url: MUST be a full course URL with /watch?v=, /learn/, /course/, or /certification/ path
        - domain: "${targetDomain}"
        - skillLevel: "${skillLevel}"
        - price: number (0 for free)
        - rating: 4.0-5.0
        - duration: realistic (e.g., "12 hours", "6 weeks", "Self-paced")
        - description: under 150 characters
        - isFree: true/false
        
        Return ONLY valid JSON with this exact structure:
        {
          "courses": [
            {
              "id": "example-1",
              "title": "Complete ${targetDomain} Course",
              "provider": "YouTube",
              "url": "https://www.youtube.com/watch?v=EXAMPLE_VIDEO_ID",
              "domain": "${targetDomain}",
              "skillLevel": "${skillLevel}",
              "price": 0,
              "rating": 4.8,
              "duration": "10 hours",
              "description": "Comprehensive tutorial covering all fundamentals",
              "isFree": true
            }
          ]
        }`;

        const model = genAI.getGenerativeModel({ 
          model: DEFAULT_MODEL,
          generationConfig: {
          temperature: 0.7,
            responseMimeType: "application/json",
          },
          systemInstruction: "You recommend REAL courses from platforms like YouTube, Coursera, Udemy, freeCodeCamp with SPECIFIC course URLs. NEVER use platform homepages like youtube.com or coursera.org - always include the full path to the actual course (/watch?v=, /learn/, /course/). You have knowledge of real popular courses and their actual URLs."
        });

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text() || "{}");
        
        // Validate and filter out invalid URLs (platform homepages)
        const validCourses = (data.courses || []).filter((course: any) => {
          const url = course.url || '';
          const isValid = 
            (url.includes('youtube.com/watch?v=') && url.length > 'https://www.youtube.com/watch?v='.length) ||
            (url.includes('coursera.org/learn/') && url.length > 'https://www.coursera.org/learn/'.length) ||
            (url.includes('coursera.org/specializations/') && url.length > 'https://www.coursera.org/specializations/'.length) ||
            (url.includes('udemy.com/course/') && url.length > 'https://www.udemy.com/course/'.length) ||
            (url.includes('freecodecamp.org/learn/') && url.length > 'https://www.freecodecamp.org/learn/'.length) ||
            (url.includes('freecodecamp.org/news/') && url.length > 'https://www.freecodecamp.org/news/'.length) ||
            (url.includes('edx.org/learn/') && url.length > 'https://www.edx.org/learn/'.length) ||
            (url.includes('khanacademy.org/') && !url.endsWith('khanacademy.org') && !url.endsWith('khanacademy.org/'));
          
          if (!isValid) {
            console.log(`Filtered out invalid course URL: ${course.title} - ${url}`);
          }
          return isValid;
        });
        
        // If AI provided valid courses, use them; otherwise fall through to fallback
        if (validCourses.length >= 6) {
          res.json({ courses: validCourses });
        } else {
          console.log(`AI provided only ${validCourses.length} valid courses, using fallback`);
          throw new Error('Insufficient valid courses from AI');
        }
      } catch (aiError) {
        console.error("AI course recommendation failed, using fallback:", aiError);
        // Fallback recommendations with realistic URLs based on domain
        const domainUrls: Record<string, { youtube: string, freecodecamp: string, coursera: string, udemy: string }> = {
          "Web Development": {
            youtube: "https://www.youtube.com/watch?v=zJSY8tbf_ys",
            freecodecamp: "https://www.freecodecamp.org/learn/2022/responsive-web-design",
            coursera: "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
            udemy: "https://www.udemy.com/course/the-complete-web-development-bootcamp"
          },
          "Machine Learning": {
            youtube: "https://www.youtube.com/watch?v=7eh4d6sabA0",
            freecodecamp: "https://www.freecodecamp.org/learn/machine-learning-with-python",
            coursera: "https://www.coursera.org/specializations/machine-learning-introduction",
            udemy: "https://www.udemy.com/course/machinelearning"
          },
          "Data Science": {
            youtube: "https://www.youtube.com/watch?v=ua-CiDNNj30",
            freecodecamp: "https://www.freecodecamp.org/learn/data-analysis-with-python",
            coursera: "https://www.coursera.org/specializations/jhu-data-science",
            udemy: "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp"
          },
          "Mobile Development": {
            youtube: "https://www.youtube.com/watch?v=0N1Cir0vN80",
            freecodecamp: "https://www.freecodecamp.org/news/learn-react-native-full-course",
            coursera: "https://www.coursera.org/specializations/android-app-development",
            udemy: "https://www.udemy.com/course/react-native-the-practical-guide"
          },
          "Cybersecurity": {
            youtube: "https://www.youtube.com/watch?v=U_P23SqJaDc",
            freecodecamp: "https://www.freecodecamp.org/news/learn-cybersecurity-handbook",
            coursera: "https://www.coursera.org/specializations/cyber-security",
            udemy: "https://www.udemy.com/course/the-complete-cyber-security-course"
          },
          "IoT": {
            youtube: "https://www.youtube.com/watch?v=h0gWfVCSGQQ",
            freecodecamp: "https://www.freecodecamp.org/news/introduction-to-iot-internet-of-things",
            coursera: "https://www.coursera.org/specializations/iot",
            udemy: "https://www.udemy.com/course/introduction-to-iot"
          },
          "Space Technology": {
            youtube: "https://www.youtube.com/watch?v=pTn6Ewhb27k",
            freecodecamp: "https://www.freecodecamp.org/news/search?query=aerospace",
            coursera: "https://www.coursera.org/learn/space-mission-design",
            udemy: "https://www.udemy.com/course/introduction-to-aerospace-engineering"
          },
          "Hardware": {
            youtube: "https://www.youtube.com/watch?v=fCxzA9_kg6s",
            freecodecamp: "https://www.freecodecamp.org/news/learn-electronics-and-arduino",
            coursera: "https://www.coursera.org/learn/build-a-computer",
            udemy: "https://www.udemy.com/course/electronics-for-beginners"
          }
        };

        const urls = domainUrls[targetDomain] || {
          youtube: "https://www.youtube.com/results?search_query=" + encodeURIComponent(targetDomain + " tutorial"),
          freecodecamp: "https://www.freecodecamp.org/news/search?query=" + encodeURIComponent(targetDomain),
          coursera: "https://www.coursera.org/search?query=" + encodeURIComponent(targetDomain),
          udemy: "https://www.udemy.com/courses/search/?q=" + encodeURIComponent(targetDomain)
        };

        // Create skill-level appropriate course titles
        const skillTitles: Record<string, { intro: string, main: string, comprehensive: string, advanced: string }> = {
          'Beginner': {
            intro: `Introduction to ${targetDomain}`,
            main: `${targetDomain} Fundamentals`,
            comprehensive: `Complete ${targetDomain} Guide for Beginners`,
            advanced: `${targetDomain} Bootcamp`
          },
          'Intermediate': {
            intro: `Intermediate ${targetDomain}`,
            main: `Building Projects with ${targetDomain}`,
            comprehensive: `Complete ${targetDomain} Course`,
            advanced: `Practical ${targetDomain} Development`
          },
          'Advanced': {
            intro: `Advanced ${targetDomain}`,
            main: `Mastering ${targetDomain}`,
            comprehensive: `Professional ${targetDomain} Development`,
            advanced: `${targetDomain} Masterclass`
          }
        };
        
        const titles = skillTitles[skillLevel] || skillTitles['Beginner'];
        
        const fallbackCourses = [
          {
            id: `${targetDomain}-free-1`,
            title: titles.intro,
            provider: "freeCodeCamp",
            url: urls.freecodecamp,
            domain: targetDomain,
            skillLevel: skillLevel,
            price: 0,
            rating: 4.8,
            duration: "Self-paced",
            description: `Learn the fundamentals of ${targetDomain} with hands-on projects`,
            isFree: true
          },
          {
            id: `${targetDomain}-free-2`,
            title: titles.main,
            provider: "YouTube",
            url: urls.youtube,
            domain: targetDomain,
            skillLevel: skillLevel,
            price: 0,
            rating: 4.7,
            duration: "3-5 hours",
            description: `${skillLevel} level introduction to ${targetDomain} concepts`,
            isFree: true
          },
          {
            id: `${targetDomain}-free-3`,
            title: titles.comprehensive,
            provider: "Coursera",
            url: urls.coursera,
            domain: targetDomain,
            skillLevel: skillLevel,
            price: 0,
            rating: 4.6,
            duration: "4 weeks",
            description: `Comprehensive ${skillLevel} level ${targetDomain} course`,
            isFree: true
          },
          {
            id: `${targetDomain}-paid-1`,
            title: titles.advanced,
            provider: "Udemy",
            url: urls.udemy,
            domain: targetDomain,
            skillLevel: skillLevel,
            price: 49.99,
            rating: 4.9,
            duration: "20 hours",
            description: `Deep dive into ${targetDomain} with real-world projects at ${skillLevel} level`,
            isFree: false
          }
        ];
        res.json({ courses: fallbackCourses });
      }
    } catch (error) {
      console.error("Error getting course recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Enroll in course
  app.post("/api/courses/enroll", async (req: Request, res: Response) => {
    try {
      const { 
        userId, courseId, title, provider, url, domain, isPaid,
        description, skillLevel, duration, rating, price 
      } = req.body;
      
      console.log("Enroll request received:", { userId, courseId, title });
      
      if (!userId || !courseId) {
        console.log("Missing fields - userId:", userId, "courseId:", courseId);
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create enrollment with complete course details
      const enrollment = await storage.enrollCourse({
        userId,
        courseId, // Store the original course ID
        courseTitle: title || `Course ${courseId}`,
        coursePlatform: provider || "Platform",
        courseUrl: url || "https://example.com",
        domain: domain || "General",
        isPaid: isPaid || false,
        progress: 0,
        completed: false,
        // Store all course details for proper display
        description: description || null,
        skillLevel: skillLevel || null,
        duration: duration || null,
        rating: rating ? Math.round(rating * 10) : null, // Store as integer (4.6 -> 46)
        price: price ? Math.round(price * 100) : null, // Store as integer cents (49.99 -> 4999)
      });

      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling:", error);
      res.status(500).json({ error: "Failed to enroll" });
    }
  });

  // Get enrolled courses
  app.get("/api/user/:userId/enrolled", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const enrolledCourses = await storage.getUserCourses(userId);
      
      // Format courses with proper field mapping for frontend
      const formattedCourses = enrolledCourses.map(course => ({
        id: course.id,
        courseId: course.courseId,
        title: course.courseTitle,
        provider: course.coursePlatform,
        url: course.courseUrl,
        domain: course.domain,
        skillLevel: course.skillLevel || 'Not specified',
        description: course.description || 'No description available',
        duration: course.duration || 'Self-paced',
        rating: course.rating ? course.rating / 10 : 0, // Convert from integer (46 -> 4.6)
        price: course.price ? course.price / 100 : 0, // Convert from cents (4999 -> 49.99)
        isFree: !course.isPaid,
        progress: course.progress || 0,
        completed: course.completed || false,
        enrolledAt: course.enrolledAt,
      }));
      
      res.json({ courses: formattedCourses });
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      res.status(500).json({ error: "Failed to fetch enrolled courses", courses: [] });
    }
  });

  // Get schedule items
  app.get("/api/schedule/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const schedules = await storage.getUserSchedules(userId);
      
      // Transform to match frontend expectations
      const items = schedules.map(s => ({
        id: s.id,
        title: s.title,
        type: 'module' as const,
        date: s.dueDate ? new Date(s.dueDate).toLocaleDateString() : 'No date',
        time: '10:00 AM',
        duration: '1 hour',
        course: s.description || 'Self Study',
        completed: s.completed
      }));
      
      res.json({ items });
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule", items: [] });
    }
  });

  // Generate AI schedule
  app.post("/api/schedule/generate", async (req: Request, res: Response) => {
    try {
      const { userId, goals } = req.body;
      
      if (!userId || !goals) {
        return res.status(400).json({ error: "User ID and goals are required" });
      }

      // Get user context
      const skills = await storage.getUserSkillLevels(userId);
      const courses = await storage.getUserCourses(userId);
      
      let scheduleItems = [];
      
      try {
        const prompt = `Create a personalized learning schedule based on these goals: "${goals}"
        
        User's current skills: ${skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ')}
        Enrolled courses: ${courses.length}
        
        Generate 5-7 specific learning tasks/milestones spread over the next 2-4 weeks.
        Each item should be actionable and time-bound.
        
        Return ONLY valid JSON:
        {
          "scheduleItems": [
            {
              "title": "Specific task or milestone",
              "description": "Course or study area",
              "dueDate": "2025-11-15"
            }
          ]
        }`;

        const model = genAI.getGenerativeModel({ 
          model: DEFAULT_MODEL,
          generationConfig: {
          temperature: 0.7,
            responseMimeType: "application/json",
          },
          systemInstruction: "You are a learning schedule expert. Create realistic, achievable learning plans."
        });

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text() || "{}");
        scheduleItems = data.scheduleItems || [];
      } catch (aiError) {
        console.error("AI schedule generation failed, using fallback:", aiError);
        // Fallback schedule
        const today = new Date();
        scheduleItems = [
          {
            title: "Review core concepts and fundamentals",
            description: "Self study",
            dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            title: "Complete practice exercises",
            description: "Hands-on practice",
            dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            title: "Build a small project",
            description: "Practical application",
            dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            title: "Review and refine skills",
            description: "Self study",
            dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ];
      }
      
      // Create schedule items in database
      for (const item of scheduleItems) {
        await storage.createSchedule({
          userId,
          courseId: null,
          title: item.title,
          description: item.description,
          dueDate: new Date(item.dueDate),
          completed: false
        });
      }

      res.json({ success: true, itemsCreated: scheduleItems.length });
    } catch (error) {
      console.error("Error generating schedule:", error);
      res.status(500).json({ error: "Failed to generate schedule" });
    }
  });

  // Complete schedule item
  app.post("/api/schedule/:itemId/complete", async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      await storage.updateScheduleCompletion(itemId, true);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing schedule item:", error);
      res.status(500).json({ error: "Failed to complete item" });
    }
  });

  // Get AI mentor recommendations
  app.get("/api/mentor/recommendations/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const skills = await storage.getUserSkillLevels(userId);
      const courses = await storage.getUserCourses(userId);
      const quizHistory = await storage.getUserQuizAttempts(userId);
      
      const completedCourses = courses.filter(c => c.completed);
      const inProgressCourses = courses.filter(c => !c.completed && (c.progress || 0) > 0);
      const assessedDomains = skills.map(s => s.domain);
      const unevaluatedDomains = inProgressCourses
        .map(c => c.domain)
        .filter(d => d && !assessedDomains.includes(d));
      
      const recommendations = [];
      
      // Recommend quizzes for unevaluated domains
      if (unevaluatedDomains.length > 0) {
        recommendations.push({
          type: 'quiz',
          title: 'Take a Skills Assessment',
          description: `You're learning ${unevaluatedDomains.join(', ')}. Assess your skills to track your progress and get personalized recommendations!`,
          action: 'Take Quiz',
          link: '/assessments'
        });
      }
      
      // Recommend quizzes after course completion
      if (completedCourses.length > 0 && skills.length < completedCourses.length) {
        recommendations.push({
          type: 'quiz',
          title: 'Validate Your Learning',
          description: `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''}! Take a quiz to measure what you've learned.`,
          action: 'Start Assessment',
          link: '/assessments'
        });
      }
      
      // Recommend courses if they have skills but few enrollments
      if (skills.length > 0 && courses.length < 3) {
        recommendations.push({
          type: 'course',
          title: 'Expand Your Learning',
          description: `Based on your ${skills.map(s => s.domain).join(', ')} skills, there are great courses waiting for you!`,
          action: 'Browse Courses',
          link: '/courses'
        });
      }
      
      // Encourage first quiz if completely new
      if (skills.length === 0 && quizHistory.length === 0) {
        recommendations.push({
          type: 'quiz',
          title: 'Start Your Journey',
          description: 'Take your first skills assessment to get personalized course recommendations tailored to your level!',
          action: 'Get Started',
          link: '/assessments'
        });
      }
      
      res.json({ recommendations });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations", recommendations: [] });
    }
  });

  // Chat with AI mentor
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { userId, message, conversationHistory } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: "User ID and message are required" });
      }

      // Get comprehensive user context - ALWAYS fetch fresh data
      const skills = await storage.getUserSkillLevels(userId);
      const courses = await storage.getUserCourses(userId);
      const allQuizHistory = await storage.getUserQuizAttempts(userId);
      const quizHistory = allQuizHistory.slice(0, 5); // Get latest 5
      
      // Load previous conversation history from database (adaptive learning/memory)
      const storedChatHistory = await storage.getUserChatHistory(userId, 30); // Get last 30 messages for better context
      const dbConversationHistory = storedChatHistory
        .reverse() // Reverse to get chronological order
        .slice(0, 20) // Use last 20 for context
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
      
      // Analyze learning progress
      const completedCourses = courses.filter(c => c.completed);
      const inProgressCourses = courses.filter(c => !c.completed && (c.progress || 0) > 0);
      const notStartedCourses = courses.filter(c => !c.completed && (c.progress || 0) === 0);
      const assessedDomains = skills.map(s => s.domain);
      const unevaluatedDomains = inProgressCourses
        .map(c => c.domain)
        .filter(d => d && !assessedDomains.includes(d));
      
      // Build detailed course information for context
      const courseDetails = courses.map(c => ({
        title: c.courseTitle,
        domain: c.domain,
        platform: c.coursePlatform,
        progress: c.progress || 0,
        completed: c.completed,
        url: c.courseUrl,
        skillLevel: c.skillLevel,
        description: c.description
      })).slice(0, 15); // Limit to 15 most recent courses
      
      // Get recent quiz performance for adaptive learning
      const recentQuizScores = quizHistory.map(q => ({
        domain: q.domain,
        score: q.score,
        total: q.totalQuestions,
        percentage: Math.round((q.score / q.totalQuestions) * 100),
        skillLevel: q.skillLevelDetermined,
        date: q.completedAt
      }));
      
      // Analyze learning patterns for adaptive responses
      const learningPatterns = {
        mostActiveDomain: assessedDomains.length > 0 ? assessedDomains[0] : null,
        averageQuizScore: recentQuizScores.length > 0 
          ? Math.round(recentQuizScores.reduce((sum, q) => sum + q.percentage, 0) / recentQuizScores.length)
          : null,
        improvementTrend: recentQuizScores.length >= 2 
          ? (recentQuizScores[0].percentage > recentQuizScores[recentQuizScores.length - 1].percentage ? 'improving' : 'stable')
          : null,
        learningVelocity: inProgressCourses.length > 0 
          ? Math.round(inProgressCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / inProgressCourses.length)
          : 0,
        completionRate: courses.length > 0 
          ? Math.round((completedCourses.length / courses.length) * 100)
          : 0
      };
      
      // Analyze conversation patterns for adaptive learning
      const conversationTopics = dbConversationHistory
        .filter(m => m.role === 'user')
        .map(m => {
          const text = m.content.toLowerCase();
          if (text.includes('course') || text.includes('learn') || text.includes('study')) return 'learning';
          if (text.includes('quiz') || text.includes('test') || text.includes('assess')) return 'assessment';
          if (text.includes('help') || text.includes('how') || text.includes('what')) return 'guidance';
          if (text.includes('stuck') || text.includes('difficult') || text.includes('problem')) return 'support';
          return 'general';
        });
      
      const mostCommonTopic = conversationTopics.length > 0
        ? conversationTopics.reduce((a, b, _, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          )
        : null;
      
      // Extract user preferences and learning style from conversations
      const userPreferences = {
        prefersDetailed: conversationTopics.filter(t => t === 'guidance').length > 2,
        needsMotivation: conversationTopics.filter(t => t === 'support').length > 1,
        focusedOnCourses: conversationTopics.filter(t => t === 'learning').length > 2,
        activeInAssessments: conversationTopics.filter(t => t === 'assessment').length > 1
      };
      
      let response = "";
      
      try {
        // Check if user is asking for course recommendations - generate them dynamically
        const lowerMessage = message.toLowerCase();
        let courseRecommendations = '';
        
        if (lowerMessage.includes('course') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend') || lowerMessage.includes('learn')) {
          try {
            // Get user's skill levels to generate relevant course recommendations
            if (skills.length > 0) {
              // Get recommendations for user's assessed domains
              const topDomain = skills[0]; // Most recent or primary domain
              const recommendPrompt = `Recommend 6 high-quality courses for learning ${topDomain.domain} at ${topDomain.skillLevel} level. Include a mix of FREE and paid options. For each course provide: title, platform, url (direct course URL not homepage), isPaid, description (max 100 chars), skillLevel. Return ONLY valid JSON with courses array.`;
              
              try {
                const recommendModel = genAI.getGenerativeModel({ 
                  model: DEFAULT_MODEL,
                  generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                  },
                  systemInstruction: "You are a learning path expert. Recommend real, high-quality courses from reputable platforms. Always provide direct course URLs, not platform homepages."
                });
                
                const recommendResult = await recommendModel.generateContent(recommendPrompt);
                const recommendData = JSON.parse(recommendResult.response.text() || "{}");
                if (recommendData.courses && recommendData.courses.length > 0) {
                  const recommendedCourses = recommendData.courses.slice(0, 6).map((c: any, i: number) => 
                    `${i + 1}. "${c.title}" (${topDomain.domain}) - ${c.platform} - ${c.skillLevel || topDomain.skillLevel} level${c.url ? ` - ${c.url}` : ''}${c.isPaid ? ' (Paid)' : ' (Free)'}`
                  ).join('\n');
                  courseRecommendations = `\n\nAVAILABLE COURSE RECOMMENDATIONS (for ${topDomain.domain} at ${topDomain.skillLevel} level):\n${recommendedCourses}`;
                }
              } catch (err) {
                // Silently fail - we'll use enrolled courses instead
              }
            }
          } catch (err) {
            // Silently fail - we'll use enrolled courses instead
          }
        }
        
        // Build comprehensive user profile for personalization
        const userProfile = {
          skills: skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ') || 'None yet',
          totalCourses: courses.length,
          completedCourses: completedCourses.map(c => c.courseTitle).join(', ') || 'None',
          inProgressCourses: inProgressCourses.map(c => `${c.courseTitle} (${c.progress}% complete)`).join(', ') || 'None',
          notStartedCourses: notStartedCourses.map(c => c.courseTitle).join(', ') || 'None',
          quizAttempts: quizHistory.length,
          unevaluatedDomains: unevaluatedDomains.join(', ') || 'None',
          mostActiveDomain: learningPatterns.mostActiveDomain || 'None',
          averageScore: learningPatterns.averageQuizScore || 'N/A',
          learningVelocity: learningPatterns.learningVelocity,
          completionRate: learningPatterns.completionRate,
          improvementTrend: learningPatterns.improvementTrend || 'N/A',
          conversationStyle: mostCommonTopic || 'general',
          preferences: userPreferences
        };
        
        const systemPrompt = `You are an advanced AI learning mentor on SkillPath, an AI-powered learning platform. You are like ChatGPT - highly conversational, intelligent, and deeply personalized. You have COMPLETE MEMORY of all previous conversations and provide ADAPTIVE, CONTEXTUAL guidance that evolves with the user.

🎯 YOUR CORE PERSONALITY:
- Be conversational, warm, and engaging like ChatGPT
- Show genuine interest in the user's learning journey
- Adapt your communication style to match the user's preferences
- Remember and reference past conversations naturally
- Ask follow-up questions when appropriate
- Provide detailed, thoughtful responses
- Be encouraging but realistic
- Use natural language, not robotic templates

🧠 ADAPTIVE LEARNING CAPABILITIES:
- Learn from conversation patterns to understand user's learning style
- Remember what topics interest the user most
- Adapt response depth based on user's needs (${userProfile.preferences.prefersDetailed ? 'User prefers detailed explanations' : 'Keep responses concise unless asked for detail'})
- Recognize when user needs motivation vs. technical help
- Track learning progress and celebrate milestones
- Identify knowledge gaps and suggest targeted learning

👤 STUDENT PROFILE (REAL DATA - USE THIS FOR PERSONALIZATION):
**Current Skills & Levels:**
${userProfile.skills}

**Learning Progress:**
- Total courses enrolled: ${userProfile.totalCourses}
- Completed: ${completedCourses.length} course${completedCourses.length !== 1 ? 's' : ''} (${userProfile.completedCourses})
- In Progress: ${inProgressCourses.length} course${inProgressCourses.length !== 1 ? 's' : ''} (${userProfile.inProgressCourses})
- Not Started: ${notStartedCourses.length} course${notStartedCourses.length !== 1 ? 's' : ''} (${userProfile.notStartedCourses})

**Performance Metrics:**
- Quiz attempts: ${userProfile.quizAttempts}
- Average score: ${userProfile.averageScore}%
- Most active domain: ${userProfile.mostActiveDomain}
- Learning velocity: ${userProfile.learningVelocity}% average progress
- Completion rate: ${userProfile.completionRate}%
- Improvement trend: ${userProfile.improvementTrend}
- Domains needing assessment: ${userProfile.unevaluatedDomains}

**Learning Style & Preferences:**
- Conversation focus: ${userProfile.conversationStyle}
- Prefers detailed explanations: ${userProfile.preferences.prefersDetailed ? 'Yes' : 'No'}
- Needs motivation: ${userProfile.preferences.needsMotivation ? 'Yes - be encouraging' : 'No'}
- Course-focused: ${userProfile.preferences.focusedOnCourses ? 'Yes' : 'No'}
- Assessment-active: ${userProfile.preferences.activeInAssessments ? 'Yes' : 'No'}

ENROLLED COURSES (USE THESE SPECIFIC COURSES - Mention by name when relevant):
${courseDetails.length > 0 ? courseDetails.map((c, i) => 
  `${i + 1}. "${c.title}" (${c.domain}) - ${c.platform} - ${c.completed ? '✅ Completed' : c.progress > 0 ? `📚 ${c.progress}% progress` : '📋 Not started'} - ${c.skillLevel || 'N/A'} level - ${c.url}${c.description ? `\n   Description: ${c.description}` : ''}`
).join('\n') : 'No courses enrolled yet'}

RECENT QUIZ PERFORMANCE:
${recentQuizScores.length > 0 ? recentQuizScores.map((q, i) => 
  `${i + 1}. ${q.domain}: ${q.score}/${q.total} (${q.percentage}%) - ${q.skillLevel} level`
).join('\n') : 'No quiz attempts yet'}

${courseRecommendations}

PLATFORM FEATURES & NAVIGATION:
- **Dashboard**: Shows learning progress, enrolled courses (${courses.length} total), skill levels (${Object.keys(skills).length} domains assessed), and quick actions
- **Courses**: Browse and enroll in personalized course recommendations. User can filter by domain and see enrolled courses.
- **Assessments**: Take AI-generated quizzes to evaluate skills. Can retake quizzes to improve assessment accuracy.
- **Schedule**: Plan learning activities and track completion progress
- **AI Mentor**: (this page) Get personalized guidance, ask questions, receive proactive recommendations

💬 CONVERSATION GUIDELINES (ChatGPT-like Quality):

**Response Style:**
- Be natural, conversational, and human-like
- Show personality and warmth
- Use "you" and "your" to make it personal
- Vary sentence structure - don't sound repetitive
- Use emojis sparingly and appropriately (🎯 📚 ✅ 💡)
- Break up long responses with line breaks for readability

**Personalization Rules:**
1. **ALWAYS use real data**: Reference specific course names, exact progress percentages, actual skill levels
2. **Reference past conversations**: "As we discussed earlier...", "Remember when you asked about...", "Building on what you mentioned..."
3. **Adapt to learning style**: 
   - If user prefers details → Provide comprehensive explanations
   - If user needs motivation → Be encouraging and highlight progress
   - If user is course-focused → Prioritize course recommendations
4. **Context-aware responses**:
   - If asking about courses → Start with their enrolled courses by name, then suggest new ones
   - If asking about progress → Use specific numbers: "${inProgressCourses[0]?.courseTitle || 'your course'}" is ${inProgressCourses[0]?.progress || 0}% complete
   - If asking about skills → Reference exact levels: "${skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ') || 'None yet'}"
   - If asking about dashboard → Explain with real numbers: ${courses.length} courses, ${skills.length} skill assessments

**Adaptive Learning Features:**
- **Remember preferences**: If user asked for detailed explanations before, provide them again
- **Track interests**: Note which domains/topics user asks about most
- **Celebrate progress**: "Great job completing ${completedCourses.length} course${completedCourses.length !== 1 ? 's' : ''}!"
- **Identify gaps**: "I notice you haven't assessed ${unevaluatedDomains[0] || 'some domains'} yet..."
- **Suggest next steps**: Based on their actual progress and goals

**Response Quality:**
- Length: 2-5 paragraphs typically, but adapt to question complexity
- Depth: Match user's needs - some want quick answers, others want deep dives
- Tone: Supportive, knowledgeable, friendly - like a trusted mentor
- Examples: Use real examples from their courses and progress
- Actionable: Always provide specific, actionable advice

**Critical Rules:**
- NEVER repeat the same response twice
- NEVER use generic templates - every response must be unique
- ALWAYS reference their actual data (course names, progress, skills)
- ALWAYS consider conversation history for context
- ALWAYS personalize based on their learning patterns
- Be like ChatGPT - intelligent, helpful, and conversational`;

        // Merge conversation history: database history + current session history + new message
        // Remove duplicates and ensure chronological order
        const sessionHistory = conversationHistory || [];
        const allHistory = [...dbConversationHistory, ...sessionHistory];
        // Remove duplicate consecutive messages
        const uniqueHistory = allHistory.filter((msg, idx, arr) => {
          if (idx === 0) return true;
          const prev = arr[idx - 1];
          return !(msg.role === prev.role && msg.content === prev.content);
        }).slice(-25); // Keep last 25 messages for better context (increased from 15)
        
        // Analyze conversation flow for better context understanding
        const recentUserMessages = uniqueHistory
          .filter(m => m.role === 'user')
          .slice(-5)
          .map(m => m.content);
        
        const conversationContext = {
          recentTopics: recentUserMessages,
          messageCount: uniqueHistory.length,
          hasHistory: uniqueHistory.length > 2
        };

        // Enhance system prompt with conversation context for better personalization
        const enhancedSystemPrompt = `${systemPrompt}

📝 RECENT CONVERSATION CONTEXT:
${conversationContext.hasHistory ? `- We've had ${conversationContext.messageCount} messages in this conversation
- Recent topics discussed: ${conversationContext.recentTopics.slice(-3).join(', ')}
- Use this context to provide continuity and avoid repetition` : '- This is the start of our conversation'}

💡 CURRENT USER QUESTION: "${message}"

Remember: Respond naturally, personally, and helpfully. Be like ChatGPT - intelligent, conversational, and deeply personalized.`;
        
        // Convert messages to Gemini format
        const { systemInstruction, conversationHistory: geminiHistory } = convertMessagesToGemini([
          { role: "system", content: enhancedSystemPrompt },
          ...uniqueHistory,
          { role: "user", content: message }
        ]);

        // Start a chat session with Gemini - optimized for ChatGPT-like conversations
        const model = genAI.getGenerativeModel({ 
          model: DEFAULT_MODEL,
          generationConfig: {
            temperature: 0.95, // Higher temperature for more natural, varied responses
            maxOutputTokens: 1000, // Longer responses for detailed, helpful answers
            topP: 0.95, // Nucleus sampling for better quality
            topK: 40, // Top-k sampling for diversity
          },
          systemInstruction: systemInstruction || systemPrompt
        });

        // Build conversation history for Gemini (all except the last user message)
        const history = geminiHistory.slice(0, -1);
        const lastUserMessage = geminiHistory[geminiHistory.length - 1];

        // Start chat with history
        const chat = model.startChat({
          history: history.length > 0 ? history : undefined,
        });

        // Send the last user message
        const result = await chat.sendMessage(lastUserMessage.parts[0].text);
        response = result.response.text() || "";
      } catch (aiError) {
        console.error("AI chat failed, using fallback:", aiError);
        // Context-aware fallback responses with real data
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('motivat') || lowerMessage.includes('stuck') || lowerMessage.includes('difficult')) {
          const progressMsg = inProgressCourses.length > 0 
            ? `You're making progress on ${inProgressCourses[0].courseTitle} (${inProgressCourses[0].progress}% complete) - keep going!`
            : completedCourses.length > 0
            ? `You've already completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''} - that's amazing progress!`
            : '';
          response = `${progressMsg} Learning can be challenging, but remember that every expert was once a beginner. Take it one step at a time, celebrate small wins, and don't be afraid to ask for help. You've got this!`;
        } else if (lowerMessage.includes('course') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend') || lowerMessage.includes('what should') || lowerMessage.includes('learn')) {
          // Smart course recommendations - prioritize enrolled courses with specific details
          if (courses.length > 0) {
            let courseSuggestion = '';
            if (inProgressCourses.length > 0) {
              const courseList = inProgressCourses.map(c => `"${c.courseTitle}" (${c.progress}% complete on ${c.coursePlatform})`).join(', ');
              courseSuggestion = `I see you're currently working on: ${courseList}. I'd recommend continuing with these courses to build on your progress! `;
            }
            if (completedCourses.length > 0) {
              const completedList = completedCourses.map(c => `"${c.courseTitle}"`).join(', ');
              courseSuggestion += `You've completed: ${completedList}. Great work! `;
            }
            if (notStartedCourses.length > 0) {
              courseSuggestion += `You also have ${notStartedCourses.length} course${notStartedCourses.length > 1 ? 's' : ''} not started yet. `;
            }
            
            if (skills.length > 0) {
              const skillDetails = skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ');
              courseSuggestion += `Based on your assessed skills in ${skillDetails}, you might want to explore more advanced courses in those areas. Check the Courses page for personalized recommendations!`;
            } else {
              courseSuggestion += `Consider taking a skills assessment to get personalized course recommendations tailored to your level!`;
            }
            
            response = courseSuggestion || `You have ${courses.length} enrolled course${courses.length > 1 ? 's' : ''}. Check out the Courses page to see them and discover new ones based on your skill levels!`;
          } else if (skills.length > 0) {
            const skillDetails = skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ');
            response = `Based on your ${skillDetails} skills, I'd recommend checking out the Courses page to find courses tailored to your level. You can filter by domain and see personalized recommendations!`;
          } else if (unevaluatedDomains.length > 0) {
            response = `Great question! I notice you're making progress in ${unevaluatedDomains.join(', ')}. Once you feel comfortable with the material, I'd recommend taking a skill assessment quiz to measure your progress and get personalized course recommendations. Head to the Assessments page when you're ready!`;
          } else {
            response = `I'd recommend starting with a skills assessment to understand your current level, then check the Courses page for personalized recommendations. Visit the Assessments page to get started!`;
          }
        } else if (lowerMessage.includes('quiz') || lowerMessage.includes('assess') || lowerMessage.includes('test')) {
          if (skills.length === 0) {
            response = "Taking your first skills assessment is a great way to start! It'll help us understand your current level and recommend the perfect courses for you. Visit the Assessments page to get started!";
          } else {
            const skillDetails = skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ');
            response = `You've already assessed your skills in ${skillDetails}. ${unevaluatedDomains.length > 0 ? `Consider taking quizzes in ${unevaluatedDomains.join(', ')} to track your progress in those areas!` : 'Keep learning and reassess periodically to track your improvement!'}`;
          }
        } else if (lowerMessage.includes('dashboard') || lowerMessage.includes('progress') || lowerMessage.includes('overview')) {
          response = `Your dashboard shows your learning progress! You have ${courses.length} enrolled course${courses.length > 1 ? 's' : ''} (${completedCourses.length} completed, ${inProgressCourses.length} in progress), and you've assessed your skills in ${skills.length} domain${skills.length !== 1 ? 's' : ''}: ${skills.map(s => `${s.domain} (${s.skillLevel})`).join(', ') || 'None yet'}. You can also see quick actions to take quizzes, browse courses, and manage your schedule.`;
        } else if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('time')) {
          response = "Creating a consistent learning schedule is key to success! Try dedicating specific time blocks each day, even if it's just 30 minutes. Use the Schedule feature to plan your learning milestones and track your progress.";
        } else {
          // Generic but still personalized response
          const personalizedNote = courses.length > 0 
            ? `I see you're working on ${courses.length} course${courses.length > 1 ? 's' : ''}. `
            : skills.length > 0
            ? `Based on your ${skills.map(s => s.domain).join(', ')} skills, `
            : '';
          response = `${personalizedNote}I'm here to support your learning journey! I can help you with study strategies, course recommendations, staying motivated, or planning your learning schedule. What would you like to focus on today?`;
        }
      }

      // Save to database (gracefully handle if user doesn't exist)
      try {
        await storage.saveChatMessage({ userId, role: "user", content: message });
        await storage.saveChatMessage({ userId, role: "assistant", content: response });
      } catch (saveError) {
        // Log but don't fail - chat should work even if persistence fails
        console.warn("Could not save chat messages (user may not exist in DB):", saveError);
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
