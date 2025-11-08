import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create or update user after onboarding
  app.post("/api/user/onboard", async (req: Request, res: Response) => {
    try {
      const { name, domains } = req.body;
      
      if (!name || !domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: "Name and domains are required" });
      }

      // Create a simple demo user (in production, this would use proper authentication)
      const userId = `user-${Date.now()}`;
      const user = await storage.createUser({
        username: name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
        password: 'demo-password',
        selectedDomains: domains
      });

      res.json({ userId: user.id, username: user.username });
    } catch (error) {
      console.error("Error onboarding user:", error);
      res.status(500).json({ error: "Failed to onboard user" });
    }
  });

  // Fallback quiz in case AI generation fails
  const getFallbackQuiz = (domain: string) => ({
    domain,
    questions: [
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
    ]
  });

  // Generate quiz based on selected domains
  app.post("/api/quiz/generate", async (req: Request, res: Response) => {
    try {
      const { domains, userId } = req.body;
      
      if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(400).json({ error: "Domains are required" });
      }

      const domain = domains[0]; // Generate quiz for first domain
      
      try {
        const prompt = `Generate a skill assessment quiz for ${domain}. 
        Create 10 multiple choice questions that progressively test knowledge from beginner to advanced level.
        Include questions covering:
        - Fundamental concepts (questions 1-3)
        - Intermediate topics (questions 4-7)  
        - Advanced techniques (questions 8-10)
        
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

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a skill assessment expert. Generate accurate, well-structured quizzes in valid JSON format only." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = completion.choices[0].message.content || "{}";
        const quizData = JSON.parse(content);
        
        // Validate quiz structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          console.log("Invalid quiz structure from OpenAI, using fallback");
          return res.json(getFallbackQuiz(domain));
        }
        
        res.json({ 
          domain,
          questions: quizData.questions
        });
      } catch (aiError) {
        console.error("OpenAI quiz generation failed, using fallback:", aiError);
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

      res.json({
        score,
        totalQuestions,
        percentage,
        skillLevel,
        attemptId: attempt.id
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
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ error: "Failed to fetch skills" });
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a learning path expert. Recommend real, high-quality courses from reputable platforms." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const data = JSON.parse(completion.choices[0].message.content || "{}");
      
      res.json({ courses: data.courses || [] });
    } catch (error) {
      console.error("Error recommending courses:", error);
      res.status(500).json({ error: "Failed to recommend courses" });
    }
  });

  // Enroll in a course
  app.post("/api/courses/enroll", async (req: Request, res: Response) => {
    try {
      const { userId, courseTitle, coursePlatform, courseUrl, domain, isPaid } = req.body;
      
      if (!userId || !courseTitle || !courseUrl || !domain) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const course = await storage.enrollCourse({
        userId,
        courseTitle,
        coursePlatform,
        courseUrl,
        domain,
        isPaid: isPaid || false,
        progress: 0,
        completed: false
      });

      res.json(course);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ error: "Failed to enroll in course" });
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

  // AI Chat endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { userId, message, history } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: "User ID and message are required" });
      }

      // Get user's context (skill levels, enrolled courses)
      const skills = await storage.getUserSkillLevels(userId);
      const courses = await storage.getUserCourses(userId);
      
      const systemPrompt = `You are an AI learning mentor. Help users with their learning journey.
      
      User's skill levels: ${skills.map(s => `${s.domain}: ${s.skillLevel}`).join(', ')}
      Enrolled courses: ${courses.length}
      
      Provide personalized advice, answer questions about their learning path, suggest study strategies, 
      and help them stay motivated. Be encouraging and supportive.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...(history || []),
        { role: "user" as const, content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;

      // Save messages to database
      await storage.saveChatMessage({ userId, role: "user", content: message });
      await storage.saveChatMessage({ userId, role: "assistant", content: response || "" });

      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
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

  const httpServer = createServer(app);

  return httpServer;
}
