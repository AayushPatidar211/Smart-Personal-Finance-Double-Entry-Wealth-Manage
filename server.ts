import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK as per guideline
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Financial Analyst System Prompt
const FINANCIAL_ANALYST_SYSTEM_PROMPT = `You are FinWise AI, an enterprise-grade Senior Financial Analyst & Personal Finance Advisor with deep expertise in fintech, budgeting (50/30/20 rule, zero-based budgeting), debt reduction (snowball & avalanche), investment allocation, and cash flow optimization.
You analyze financial transactions, detect anomalies, forecast cash flow, and give actionable, mathematically sound, empathetic, and conservative advice.
Always be structured, concise, and professional. Mention specific dollar amounts and percentages where appropriate.
If asked about sensitive data or predictions, give balanced, scenario-based guidance.`;

// API endpoint for "Ask FinWise" (RAG-lite chat with transaction context)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, contextTransactions, accounts, budgets } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const promptContext = `
USER CONTEXT & FINANCIAL LEDGER SNAPSHOT:
Accounts: ${JSON.stringify(accounts || [])}
Current Budgets: ${JSON.stringify(budgets || [])}
Recent Transactions Sample: ${JSON.stringify(contextTransactions || [])}

USER QUESTION:
"${question}"

Provide a structured, insightful response formatted in Markdown with:
1. Direct Financial Analysis & Key Takeaway
2. Specific Observations (mention numbers/percentages if applicable)
3. Actionable Next Steps / Recommendations
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContext,
      config: {
        systemInstruction: FINANCIAL_ANALYST_SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });

    res.json({
      answer: response.text || 'Unable to generate analysis at this time.',
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: 'Failed to generate financial insight',
      details: error.message || 'Internal server error',
    });
  }
});

// API endpoint for Monthly Spending Summary & Anomaly Detection
app.post('/api/ai/analyze-anomalies', async (req: Request, res: Response) => {
  try {
    const { transactions, monthlyBudgetTotal } = req.body;

    const prompt = `
Analyze the following expense transactions and monthly budget limit of $${monthlyBudgetTotal || 4500}.
Transactions:
${JSON.stringify(transactions || [])}

Perform deep anomaly detection:
1. Detect any categories or transactions that exceed expected thresholds (e.g. 3x normal, surge in dining, duplicate charges, unexpected subscriptions).
2. Calculate total burn rate and remaining runway or surplus.
3. Return a JSON response adhering to this format:
{
  "monthlySummary": "string summary",
  "totalSpent": number,
  "topCategory": "string",
  "anomalies": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "category": "string",
      "description": "string",
      "impactAmount": number,
      "recommendedAction": "string"
    }
  ],
  "savingOpportunities": [
    {
      "title": "string",
      "potentialMonthlySavings": number,
      "advice": "string"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: FINANCIAL_ANALYST_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in anomaly detection:', error);
    res.status(500).json({
      error: 'Failed to analyze anomalies',
      details: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'FinWise AI Platform Backend (Spring Boot Architecture Simulation)',
    version: '1.0.0-SNAPSHOT',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`FinWise AI server running at http://localhost:${PORT}`);
  });
}

startServer();
