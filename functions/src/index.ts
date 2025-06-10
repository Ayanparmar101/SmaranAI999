import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import * as cors from 'cors';



// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI (with fallback for local development)
const getOpenAIKey = () => {
  try {
    return functions.config().openai?.key || process.env.OPENAI_API_KEY || 'demo-key';
  } catch (error) {
    console.warn('OpenAI config not found, using demo mode');
    return 'demo-key';
  }
};

const openai = new OpenAI({
  apiKey: getOpenAIKey(),
});

// CORS configuration
const corsHandler = cors({ origin: true });






