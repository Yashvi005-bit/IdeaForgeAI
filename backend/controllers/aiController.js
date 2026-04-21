import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());

const getModel = () => genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: { responseMimeType: "application/json" }
});

// Helper: parse JSON from Gemini response (strips markdown code fences)
function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// POST /api/thinking
export async function getThinkingQuestions(req, res) {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const model = getModel();
    const prompt = `You are a startup mentor. A user has an idea: "${idea}"
    
    Act as a mentor and ask 4-5 insightful guiding questions to help them think deeply and refine their idea.
    These questions should cover: problem clarity, target audience, unique value, technical feasibility, and market opportunity.
    
    Return ONLY a JSON object with this exact structure (no markdown, no extra text):
    {
      "questions": [
        "Question 1?",
        "Question 2?",
        "Question 3?",
        "Question 4?",
        "Question 5?"
      ]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJSON(text);
    res.json(data);
  } catch (err) {
    console.error('Thinking error:', err);
    res.status(500).json({ error: 'Failed to generate questions', details: err.message });
  }
}

// POST /api/judge
export async function getJudgeEvaluation(req, res) {
  try {
    const { idea, answers } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const model = getModel();
    const answersContext = answers ? `\n\nUser's additional context:\n${answers}` : '';
    const prompt = `You are a panel of 3 expert hackathon judges evaluating this idea: "${idea}"${answersContext}

    Evaluate from three perspectives and provide scores out of 100 with detailed, constructive feedback.
    
    Return ONLY a JSON object with this exact structure (no markdown, no extra text):
    {
      "technical": {
        "score": 75,
        "feedback": "Detailed technical feedback here..."
      },
      "innovation": {
        "score": 80,
        "feedback": "Detailed innovation feedback here..."
      },
      "business": {
        "score": 70,
        "feedback": "Detailed business viability feedback here..."
      }
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJSON(text);
    res.json(data);
  } catch (err) {
    console.error('Judge error:', err);
    res.status(500).json({ error: 'Failed to evaluate idea', details: err.message });
  }
}

// POST /api/improve
export async function getImprovedIdea(req, res) {
  try {
    const { idea, answers } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const model = getModel();
    const answersContext = answers ? `\n\nUser's reflection answers:\n${answers}` : '';
    const prompt = `You are a product innovation expert. Given this original idea: "${idea}"${answersContext}
    
    Improve the idea to make it significantly more innovative, practical, and market-ready for a hackathon.
    Make it more specific, add unique differentiators, and enhance its value proposition.
    
    Return ONLY a JSON object with this exact structure (no markdown, no extra text):
    {
      "originalIdea": "${idea}",
      "improvedIdea": "A detailed, enhanced version of the idea with clear improvements...",
      "keyImprovements": [
        "Improvement 1",
        "Improvement 2",
        "Improvement 3"
      ]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJSON(text);
    res.json(data);
  } catch (err) {
    console.error('Improve error:', err);
    res.status(500).json({ error: 'Failed to improve idea', details: err.message });
  }
}

// POST /api/pitch
export async function getPitch(req, res) {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const model = getModel();
    const prompt = `You are a startup pitch expert. Generate a compelling, structured pitch for this idea: "${idea}"
    
    Return ONLY a JSON object with this exact structure (no markdown, no extra text):
    {
      "problem": "The core problem being solved...",
      "solution": "How this idea solves the problem...",
      "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4"
      ],
      "targetUsers": "Description of the primary target users...",
      "techStack": [
        "Technology 1",
        "Technology 2",
        "Technology 3"
      ],
      "pitch": "A compelling 30-second pitch script that covers the problem, solution, and call to action..."
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJSON(text);
    res.json(data);
  } catch (err) {
    console.error('Pitch error:', err);
    res.status(500).json({ error: 'Failed to generate pitch', details: err.message });
  }
}
