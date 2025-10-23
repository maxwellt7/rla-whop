import { callClaude } from '../config/anthropic.js';
import { safeParseJSON, formatError, logAPICall } from '../utils/helpers.js';

export async function analyzeAvatarRoute(req, res) {
  const startTime = Date.now();
  
  try {
    const avatarData = req.body;

    const systemPrompt = `You are an expert in customer psychology, Todd Brown's WEB Analysis (Wants, Emotions, Beliefs), 
and deep avatar profiling. You help identify the primary emotional currency and craft compelling positioning messages.`;

    const userPrompt = `Analyze this avatar data and provide enhanced insights INCLUDING completing the empathy map and goals grid:

DEMOGRAPHICS:
- Age: ${avatarData.demographics.age}
- Gender: ${avatarData.demographics.gender}
- Location: ${avatarData.demographics.location}
- Income: ${avatarData.demographics.income}
- Education: ${avatarData.demographics.education}
- Occupation: ${avatarData.demographics.occupation}

WEB ANALYSIS:
Wants: ${avatarData.webAnalysis.wants.filter(w => w).join(', ')}
Emotions: ${avatarData.webAnalysis.emotions.filter(e => e).join(', ')}
Beliefs: ${avatarData.webAnalysis.beliefs.filter(b => b).join(', ')}
Dominant Emotion: ${avatarData.webAnalysis.dominantEmotion}

Based on this information, provide a comprehensive analysis in the following JSON format:
{
  "primaryCurrency": "The most important value (Time/Money/Status/Health/Freedom/Security/etc) - identify which one matters most",
  "millionDollarMessage": "A compelling positioning statement: I help [AVATAR] achieve [GOAL], so they can [DREAM] without [PAIN]",
  "empathyMap": {
    "seeing": ["what they see in their environment 1", "what they see 2", "what they see 3", "what they see 4", "what they see 5"],
    "hearing": ["what they hear from others 1", "what they hear 2", "what they hear 3", "what they hear 4", "what they hear 5"],
    "saying": ["what they say out loud 1", "what they say 2", "what they say 3", "what they say 4", "what they say 5"],
    "thinking": ["what they think about 1", "what they think 2", "what they think 3", "what they think 4", "what they think 5"],
    "feeling": ["what they feel emotionally 1", "what they feel 2", "what they feel 3", "what they feel 4", "what they feel 5"],
    "doing": ["what actions they take 1", "what they do 2", "what they do 3", "what they do 4", "what they do 5"],
    "pains": ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"],
    "gains": ["desired gain 1", "desired gain 2", "desired gain 3", "desired gain 4", "desired gain 5"]
  },
  "goalsGrid": {
    "painsAndFrustrations": ["daily frustration 1", "daily frustration 2", "daily frustration 3", "daily frustration 4", "daily frustration 5"],
    "fearsAndImplications": ["deep fear 1", "deep fear 2", "deep fear 3", "deep fear 4", "deep fear 5"],
    "goalsAndDesires": ["immediate goal 1", "immediate goal 2", "immediate goal 3", "immediate goal 4", "immediate goal 5"],
    "dreamsAndAspirations": ["ultimate dream 1", "ultimate dream 2", "ultimate dream 3", "ultimate dream 4", "ultimate dream 5"]
  },
  "insights": {
    "dominantEmotion": "The most powerful emotion driving this avatar",
    "coreDesire": "The deepest desire behind all their wants",
    "primaryFear": "The biggest fear holding them back",
    "identityStatement": "How they see themselves vs how they want to be seen",
    "buyingTriggers": ["trigger 1", "trigger 2", "trigger 3"]
  }
}

Generate 5 specific, detailed items for each empathy map and goals grid category based on the demographics and WEB analysis. Make them realistic and relevant to this specific avatar.

Provide ONLY the JSON response, no additional text.`;

    const response = await callClaude(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: 3000,
    });

    const analysisData = safeParseJSON(response);
    
    logAPICall('POST /api/analyze/avatar', Date.now() - startTime);

    res.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error('Avatar analysis error:', error);
    logAPICall('POST /api/analyze/avatar', Date.now() - startTime, false);
    res.status(500).json(formatError(error));
  }
}

