const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.post('/analyze-transcript', authMiddleware, async (req, res) => {
  const { transcript } = req.body;
  const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;

  if (!transcript) {
    return res.status(400).json({ error: 'Validation Error', message: 'Transcript is required' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'Configuration Error', message: 'Gemini API Key is missing. Please add your key in the configurations panel.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI Compliance Officer for the All India Council for Technical Education (AICTE). 
Analyze the following meeting transcript. Generate an executive summary of the meeting goals, list all approved governance decisions, and compile a compliance action items list.

Transcript:
"${transcript}"

You must respond with a JSON object formatted EXACTLY as shown below:
{
  "goalSummary": "A concise paragraph summarizing the meeting purpose, discussions, and goals.",
  "decisions": [
    "Decision sentence 1",
    "Decision sentence 2"
  ],
  "actionItems": [
    {
      "task": "Task description details",
      "assignee": "Name of official assigned to the task",
      "deadline": "Deadline date (e.g. Aug 22, 2026)"
    }
  ]
}

Return ONLY raw JSON. Do not write any markdown code blocks, backticks, or formatting text around the JSON.`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ error: 'Gemini API Error', message: errBody });
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON text returned by Gemini
    const parsedData = JSON.parse(resultText.trim());
    res.json(parsedData);

  } catch (err) {
    res.status(500).json({ error: 'AI Analysis Failed', message: err.message });
  }
});

module.exports = router;
