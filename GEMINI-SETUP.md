# Google Gemini API Integration Guide

This project now uses **Google Gemini API** instead of OpenAI for AI-powered features.

## Step-by-Step Setup

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### 2. Add API Key to .env File

Open your `.env` file in the project root and add:

```env
GEMINI_API_KEY=AIzaSyA6DJaF48HefvdwFxWY9rvXhy28pK-D_Cg
```

**Important:** Replace `AIzaSyA6DJaF48HefvdwFxWY9rvXhy28pK-D_Cg` with your actual API key.

### 3. Verify Installation

The `@google/generative-ai` package is already installed. If you need to reinstall:

```bash
npm install @google/generative-ai
```

### 4. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try these features:
   - **AI Mentor Chat**: Go to the Mentor page and ask questions
   - **Quiz Generation**: Take an assessment quiz
   - **Course Recommendations**: Browse courses or ask the AI mentor for suggestions

## Features Using Gemini API

✅ **Quiz Generation** - AI-generated skill assessment questions  
✅ **AI Mentor Chat** - Adaptive learning mentor with memory  
✅ **Course Recommendations** - Personalized course suggestions  
✅ **Learning Schedule** - AI-generated learning plans  

## Backward Compatibility

The code supports both:
- `GEMINI_API_KEY` (preferred)
- `OPENAI_API_KEY` (fallback for backward compatibility)

If both are set, `GEMINI_API_KEY` takes priority.

## Troubleshooting

### Error: "API key not found"
- Make sure your `.env` file contains `GEMINI_API_KEY=your_key_here`
- Restart the development server after adding the key

### Error: "Invalid API key"
- Verify your API key is correct
- Check that you copied the full key (starts with `AIza...`)
- Ensure there are no extra spaces or quotes around the key

### API Quota Exceeded
- Check your [Google AI Studio dashboard](https://aistudio.google.com/app/apikey) for quota limits
- Free tier has generous limits for development

## Model Used

- **Model**: `gemini-pro`
- **Features**: JSON mode, conversation history, system instructions

## Need Help?

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)

