import { callClaude } from '../config/anthropic.js';

export async function queryRoute(req, res) {
  try {
    const { projectId, question, projectData } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    const systemPrompt = `You are an expert marketing consultant and copywriter trained in Todd Brown's E5 VSL methodology. 
You help users work with their launch documents, generate copy, provide recommendations, and answer questions about their marketing strategy.

You have access to the user's complete project research and documentation. Use this information to provide specific, 
actionable answers that are tailored to their exact target market, avatar, and positioning.

When generating copy:
- Provide multiple variations (at least 3-5 options)
- Use language patterns and emotional triggers from the avatar research
- Reference the unique mechanism and big idea from the launch document
- Apply proven frameworks (AIDA, PAS, hooks from Maze Theory, etc.)

When providing recommendations:
- Explain the strategic reasoning
- Reference specific insights from the manifold or avatar analysis
- Provide implementation steps

Always be specific and actionable. Never give generic advice.`;

    // Build comprehensive context
    let contextData = '';
    
    if (projectData) {
      contextData += '\n=== PROJECT RESEARCH & DOCUMENTATION ===\n\n';
      
      // Offer Details
      if (projectData.offer) {
        contextData += '## OFFER\n';
        contextData += `Target Market: ${projectData.offer.targetMarket}\n`;
        contextData += `Problem: ${projectData.offer.pressingProblem}\n`;
        contextData += `Solution: ${projectData.offer.productDescription}\n`;
        contextData += `Promise: ${projectData.offer.productPromise}\n`;
        contextData += `Pricing: ${projectData.offer.pricing}\n\n`;
      }
      
      // Avatar Insights
      if (projectData.avatar) {
        contextData += '## AVATAR PROFILE\n';
        contextData += `Demographics: ${JSON.stringify(projectData.avatar.demographics)}\n`;
        contextData += `Primary Currency: ${projectData.avatar.primaryCurrency}\n`;
        contextData += `Million Dollar Message: ${projectData.avatar.millionDollarMessage}\n`;
        
        if (projectData.avatar.webAnalysis) {
          contextData += `\nWants: ${projectData.avatar.webAnalysis.wants?.join(', ')}\n`;
          contextData += `Emotions: ${projectData.avatar.webAnalysis.emotions?.join(', ')}\n`;
          contextData += `Beliefs: ${projectData.avatar.webAnalysis.beliefs?.join(', ')}\n`;
        }
        contextData += '\n';
      }
      
      // Key Manifold Insights (most important ones)
      if (projectData.manifold) {
        contextData += '## KEY PSYCHOLOGICAL INSIGHTS (From Manifold)\n';
        
        if (projectData.manifold.coreWound) {
          contextData += `Core Wound: ${projectData.manifold.coreWound.substring(0, 500)}...\n\n`;
        }
        if (projectData.manifold.hooks) {
          contextData += `Hooks (First 500 chars): ${projectData.manifold.hooks.substring(0, 500)}...\n\n`;
        }
        if (projectData.manifold.languagePatterns) {
          contextData += `Language Patterns (First 500 chars): ${projectData.manifold.languagePatterns.substring(0, 500)}...\n\n`;
        }
      }
      
      // Launch Document Sections (condensed)
      if (projectData.launchDoc?.sections?.length > 0) {
        contextData += '## LAUNCH DOCUMENT (Key Sections)\n';
        
        // Include most relevant sections for copywriting
        const keySection = ['Big Idea', 'Primary Promise', 'Unique Mechanism', 'Headlines', 'Perfect Lead'];
        projectData.launchDoc.sections
          .filter(s => keySection.some(key => s.title.includes(key)))
          .forEach(section => {
            contextData += `### ${section.title}\n${section.content.substring(0, 400)}...\n\n`;
          });
      }
      
      // Competitor Intelligence
      if (projectData.competitors) {
        contextData += '## COMPETITIVE POSITIONING\n';
        if (projectData.competitors.positioningAngles?.length > 0) {
          contextData += `Positioning Angles: ${projectData.competitors.positioningAngles.join(', ')}\n`;
        }
        if (projectData.competitors.marketGaps?.length > 0) {
          contextData += `Market Gaps: ${projectData.competitors.marketGaps.join(', ')}\n`;
        }
        contextData += '\n';
      }
    }

    const userPrompt = `${contextData}

USER QUESTION: ${question}

Provide a comprehensive, actionable response that leverages the specific research and insights from this project.`;

    const response = await callClaude(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: 3000,
    });

    res.json({
      success: true,
      data: {
        answer: response,
      },
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

