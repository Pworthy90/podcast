import { GoogleGenAI } from "@google/genai";

// Model Constants
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_THINKING = 'gemini-3-pro-preview';

// Context: Ensure all content is Christian-based
const CHRISTIAN_CONTEXT = `
  CONTEXT: You are a creative assistant for a Christian conversation podcast called "In the Middle".
  GUIDELINES:
  1. All content must be biblically grounded and theologically sound.
  2. Tone should be gracious, truth-seeking, and edifying.
  3. Double-check scripture references for accuracy (book, chapter, verse).
  4. Avoid heresy or taking verses out of context.
  5. Prioritize orthodox Christian theology.
`;

// Initialize lazily to avoid top-level process access issues
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

// Helper to clean JSON markdown
const cleanJson = (text: string): string => {
  let clean = text.trim();
  // Remove markdown code blocks if present
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '');
  clean = clean.replace(/\s*```$/, '');
  return clean;
};

export const geminiService = {
  // Fast tasks using Flash
  async generateIdeas(type: string, input: string) {
    const prompts: Record<string, string> = {
      TOPICS: `${CHRISTIAN_CONTEXT} Brainstorm 5 engaging podcast topics based on this concept: "${input}". Return a JSON array of strings.`,
      GUESTS: `${CHRISTIAN_CONTEXT} Suggest 3 guest archetypes or fictional personas for a Christian episode about: "${input}". Return a JSON array of objects with 'name' and 'reason' properties.`,
      SOCIAL: `${CHRISTIAN_CONTEXT} Write 3 catchy Instagram captions for a Christian podcast episode titled: "${input}". Include emojis and hashtags. Return a JSON array of strings.`,
      MERCH: `${CHRISTIAN_CONTEXT} Analyze this Christian concept/catchphrase "${input}" and suggest 5 creative T-shirt or sticker text designs. Return a JSON array of strings.`,
      THUMBNAIL: `${CHRISTIAN_CONTEXT} Create 3 detailed AI image generation prompts (for Midjourney/DALL-E) for a Christian podcast cover art about "${input}". Return a JSON array of strings.`
    };

    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompts[type] || prompts.TOPICS,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error generating ideas:", error);
      return [];
    }
  },

  async generateMetaphors(concept: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} I need to explain the concept of "${concept}" to a modern audience. Generate 3 metaphors/analogies: 
        1. From Nature
        2. From Technology
        3. From Sports
        Return a JSON array of objects with { "type": string, "analogy": string }.`,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error generating metaphors:", error);
      return [];
    }
  },

  async generateControversy(topic: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Play "Devil's Advocate" for the topic: "${topic}".
        Identify 3 strong counter-arguments or skeptical viewpoints a non-believer or skeptic might have.
        For each, provide a "Gracious Defense" or apologetic response.
        Return a JSON array of objects with { "argument": string, "defense": string }.`,
        config: { 
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json' 
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error generating controversy:", error);
      return [];
    }
  },

  async generateVerseGuide(verse: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Create a comprehensive podcast episode guide based on the bible verse ${verse}. 
        Return a valid JSON object with the following structure:
        {
          "title": "Creative Episode Title",
          "theme": "Main spiritual theme",
          "questions": ["Question 1", "Question 2", "Question 3"],
          "outline": "Markdown formatted script outline covering Intro, Scripture Reading, Main Point, Application, and Outro. Use > for quotes.",
          "runSheet": [
            { "time": "00:00", "segment": "Intro", "notes": "Welcome and hook" },
            { "time": "05:00", "segment": "Scripture", "notes": "Read verse" }
          ]
        }`,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      console.error("Error generating verse guide:", error);
      return null;
    }
  },

  async draftSponsorEmail(sponsorName: string, industry: string, notes: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Write a professional, warm sponsorship pitch email to ${sponsorName} (Industry: ${industry}). Notes: ${notes}. Keep it under 200 words.`,
      });
      return response.text;
    } catch (error) {
      console.error("Error drafting email:", error);
      return "Error generating email draft.";
    }
  },

  async generateSponsorIdeas(niche: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Suggest 5 potential companies/brands that would sponsor a podcast about: "${niche}".
        For each, provide the Company Name, Industry, and Why they are a good fit.
        Return a JSON array of objects with keys: name, industry, reason.`,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error generating sponsor ideas:", error);
      return [];
    }
  },

  async generateAdRead(sponsorName: string, industry: string, episodeTheme: string, tone: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Write a 60-second podcast ad read for ${sponsorName} (${industry}).
        Context: The episode theme is "${episodeTheme}".
        Tone: ${tone} (e.g. Funny, Serious, Casual).
        Task: Weave the product naturally into the episode theme so it doesn't feel like a jarring interruption.
        Format: Script with [Host Cues].`,
      });
      return response.text;
    } catch (error) {
      return "Error generating ad read.";
    }
  },

  async refineContent(content: string, instruction: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Rewrite the following podcast script content. 
        Instruction: ${instruction}.
        Do NOT return markdown code blocks. Just return the text.
        
        Content:
        ${content}`,
      });
      return response.text;
    } catch (error) {
      console.error("Error refining content:", error);
      return content; // Return original if error
    }
  },

  // Complex tasks using Pro with Thinking
  async planSeason(theme: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Plan a 6-episode podcast season arc around the theme: "${theme}". 
        Ensure a logical progression of ideas.
        Return a JSON array of objects, where each object has:
        - title (string)
        - theme (string)
        - status (string, set to "Draft")`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 }, // Lower budget for speed, but still thinking
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error planning season:", error);
      return [];
    }
  },

  async analyzeSeasonArc(episodes: {title: string, theme: string}[]) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Analyze the flow of these podcast episodes. Rate each one on "Intensity" (emotional weight, 1-10) and "Depth" (theological complexity, 1-10).
        Episodes: ${JSON.stringify(episodes)}
        Return a JSON array of objects with keys: episode (number), title, intensity, depth.`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error analyzing arc:", error);
      return [];
    }
  },

  async generateEpisodeOutline(title: string, theme: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Create a detailed script outline for a Christian podcast episode titled "${title}" (Theme: ${theme}). 
        Include:
        1. Hook/Intro (with specific opening lines)
        2. Key Scripture references (Check for accuracy)
        3. Main Discussion Points (3 segments)
        4. Practical Application
        5. Closing Prayer idea.
        Format as clean text with Headers using # or ##. Use > for blockquotes (key takeaways). Do not wrap in JSON or Code Blocks.`,
        config: {
          thinkingConfig: { thinkingBudget: 4096 } // Higher budget for detailed outlining
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating outline:", error);
      return "## Error\nCould not generate outline.";
    }
  },

  async findAdSlots(script: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `Analyze this podcast script. Find 2 natural breaks where an ad could be inserted without ruining the flow (e.g. transition between points).
        Return a JSON array of objects:
        {
          "context": "Quote of the last sentence before the break",
          "reason": "Why this is a good spot",
          "suggestedTransition": "A short sentence to bridge into the ad"
        }
        Script: ${script.substring(0, 8000)}...`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error finding ad slots:", error);
      return [];
    }
  },

  async generateRunSheet(title: string, theme: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Create a detailed podcast run sheet (minute-by-minute breakdown) for "${title}" (${theme}).
        Return a JSON array of objects with keys: 
        - 'time' (e.g. "00:00")
        - 'segment' (e.g. "Intro")
        - 'notes' (Include specific speaker notes, questions to ask, or key talking points. Be descriptive.)
        Target length: 30 minutes.`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error generating run sheet:", error);
      return [];
    }
  },

  async generateSocialPack(title: string, theme: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Create a Social Media Content Pack for the Christian podcast episode "${title}" (${theme}).
        Return a JSON object with this exact structure:
        {
          "youtube": {
            "titles": ["Clickbait title 1", "SEO Title 2", "Question Title 3"],
            "description": "A 3-sentence description for the video description box."
          },
          "instagram": {
            "carouselText": ["Slide 1 Text", "Slide 2 Text", "Slide 3 Text", "Slide 4 Text", "Slide 5 Text"],
            "caption": "A warm, engaging caption with hashtags."
          },
          "tiktok": {
            "script": "A 30-second script for a host to record. Include [Visual Cues] in brackets."
          }
        }`,
        config: {
          thinkingConfig: { thinkingBudget: 4096 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      console.error("Error generating social pack:", error);
      return null;
    }
  },

  // Content Repurposing
  async generateNewsletter(title: string, outline: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Convert this podcast outline into a "Monday Morning Devotional" email newsletter.
        Title: ${title}
        Outline: ${outline}
        
        Include:
        1. Subject Line
        2. Warm opening
        3. Main spiritual lesson (300 words)
        4. A "Prayer for the Week"
        Format as clean text with Headers. Do not wrap in code blocks.`,
      });
      return response.text;
    } catch (error) {
      return "Error generating newsletter.";
    }
  },

  async generateBlogPost(title: string, outline: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Convert this podcast outline into a SEO-friendly Blog Post.
        Title: ${title}
        Outline: ${outline}
        
        Use H2 headers for main points. Add a "Key Takeaways" section at the end.
        Format as clean text with Headers. Do not wrap in code blocks.`,
        config: { thinkingConfig: { thinkingBudget: 2048 } }
      });
      return response.text;
    } catch (error) {
      return "Error generating blog post.";
    }
  },

  // Guest Management
  async generateInterviewQuestions(guestBio: string, topic: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Generate 5 deep, non-generic interview questions for this guest.
        Guest Bio: ${guestBio}
        Topic: ${topic}
        
        Focus on their specific background and unique insights. Ensure questions are respectful and faith-focused.
        Return a JSON array of strings.`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      return [];
    }
  },

  async generateGuestBriefing(guestName: string, topic: string, logistics: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Write a guest briefing email to ${guestName}.
        Topic: ${topic}
        Logistics: ${logistics}
        
        Include:
        1. Warm Welcome
        2. What to expect
        3. 3 "Thought Starters" to help them prep
        4. Technical checklist (headphones, mic).`,
      });
      return response.text;
    } catch (error) {
      return "Error generating briefing.";
    }
  },

  // Post Production & Multimodal
  async analyzeMedia(base64Data: string, mimeType: string) {
    try {
      const ai = getAi();
      // Using Flash for multimodal speed and efficiency
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `${CHRISTIAN_CONTEXT} Analyze this media file for a podcast.
            1. Identify 3 "Viral" short clips (30-60s).
            2. Identify "Verbal Tics" (e.g. filler words, repeated phrases) and estimate count.
            3. Provide a summary.
            
            Return JSON:
            {
              "clips": [{"startTime": "00:00", "endTime": "00:00", "quote": "...", "reason": "..."}],
              "tics": {"word": count},
              "summary": "..."
            }`
          }
        ],
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      console.error("Error analyzing media:", error);
      return null;
    }
  },

  async analyzeTranscript(transcript: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Analyze this podcast transcript.
        1. Identify 3 "Viral" short clips (30-60s) suitable for TikTok/Reels. Quote the exact text and explain why it's viral.
        2. Identify "Verbal Tics" (e.g. filler words, repeated phrases) and count them.
        
        Return JSON:
        {
          "clips": [{"startTime": "approx", "endTime": "approx", "quote": "...", "reason": "..."}],
          "tics": {"word": count},
          "summary": "Brief summary of the episode for show notes"
        }
        
        Transcript: ${transcript.substring(0, 10000)}... (truncated for safety)`,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      return null;
    }
  },

  // Community
  async generateReply(comment: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Draft a gracious, witty, and helpful reply to this YouTube comment for a Christian podcast: "${comment}". Keep it short.`,
      });
      return response.text;
    } catch (error) {
      return "Error generating reply.";
    }
  },

  async sortMailbagQuestions(rawText: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `Analyze these listener emails/questions.
        Categorize each into: 'Theological', 'Personal', 'Feedback', or 'Troll'.
        Extract the "Asker" name if present, otherwise "Anonymous".
        
        Input Text:
        ${rawText}
        
        Return JSON array of objects: { "question": "summary of question", "asker": "name", "category": "..." }`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '[]'));
    } catch (error) {
      console.error("Error sorting mailbag:", error);
      return [];
    }
  },

  // New Theological Engine
  async generateExegeticalAnalysis(input: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Perform a deep exegetical analysis on the concept or verse: "${input}".
        Return a JSON object with the following structure:
        {
          "originalLanguage": [
            {"word": "Original Word", "definition": "Detailed definition", "pronunciation": "phonetic"}
          ],
          "historicalContext": "Who wrote it, to whom, and why. Cultural setting.",
          "crossReferences": [
            {"verse": "Book X:Y", "connection": "How it relates"}
          ]
        }`,
        config: {
          thinkingConfig: { thinkingBudget: 4096 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      console.error("Error generating exegesis:", error);
      return null;
    }
  },

  async reviewTheology(outline: string, knowledgeBase: string = "") {
    try {
      const ai = getAi();
      const contextPrompt = knowledgeBase 
        ? `\nIMPORTANT: Compare this against the user's Doctrinal/Knowledge Base provided here:\n"${knowledgeBase}"\nFlag any contradictions.` 
        : "";

      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} Act as a seminary professor and theological reviewer. Review the following podcast outline for theological accuracy, potential misunderstandings, and balance. 
        ${contextPrompt}
        Provide a report.
        
        Outline:
        ${outline}
        
        Report Structure:
        1. **Summary Assessment** (Pass/Caution)
        2. **Strengths** (What is biblically sound)
        3. **Points of Caution** (Potential for misinterpretation)
        4. **Alignment Check** (If context provided, how does it fit?)
        5. **Suggested Cross-References** (To balance the argument)
        
        Format as clean text with Headers. Do NOT use markdown code blocks.`,
        config: {
          thinkingConfig: { thinkingBudget: 4096 }
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error reviewing theology:", error);
      return "Could not complete review.";
    }
  },

  // Workflow Utility
  async generateEmergencyEpisode() {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_THINKING,
        contents: `${CHRISTIAN_CONTEXT} EMERGENCY: The guest cancelled. Generate a high-quality "Solo Host" podcast episode outline that requires minimal prep. 
        Topic ideas: Life lessons, Q&A, or a devotional.
        Return a JSON object:
        {
          "title": "Catchy Title",
          "theme": "Universal Theme",
          "outline": "Full script content (no markdown code blocks)"
        }`,
        config: {
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      console.error("Error generating emergency episode:", error);
      return null;
    }
  },
  
  async generateMediaKitCopy(stats: string, podcastTitle: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `${CHRISTIAN_CONTEXT} Create marketing copy for a Podcast Media Kit.
        Podcast: "${podcastTitle}"
        Stats: ${stats}
        
        Return JSON:
        {
          "hostBio": "Professional 50-word bio for the host (make one up based on the context 'Christian Conversation')",
          "audienceProfile": "Description of the typical listener avatar",
          "showHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
          "pitchOneLiner": "A punchy sentence to sell the show to sponsors"
        }`,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      return null;
    }
  },

  async auditRSSFeed(xmlSnippet: string) {
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Analyze this RSS Feed snippet for a Podcast. Check for SEO best practices, missing tags, and description quality.
        
        Snippet:
        ${xmlSnippet.substring(0, 2000)}
        
        Return JSON:
        {
          "score": number (0-100),
          "issues": ["Issue 1", "Issue 2"],
          "suggestions": ["Fix 1", "Fix 2"],
          "seoKeywordsFound": ["Key 1", "Key 2"]
        }`,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
      return null;
    }
  }
};