import { NextRequest, NextResponse } from "next/server";

/**
 * Analyzes conversation transcripts using Deepseek LLM
 * @route POST /api/analyzeConversation
 */
export async function POST(request: NextRequest) {
  try {
    // Get the conversation transcript data from request body
    const data = await request.json();
    const { transcript } = data;

    // Validate inputs
    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        {
          error:
            "Invalid transcript data. Expected an array of conversation messages.",
        },
        { status: 400 }
      );
    }

    // Format the conversation transcript for analysis
    const formattedConversation = formatConversationForAnalysis(transcript);

    // API key for Deepseek
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepseek API key is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `
    You are an expert visa interview evaluator. Your role is to analyze visa interview transcripts and provide structured, supportive, and actionable feedback.

Your response must be a valid JSON object only. Do not include any explanatory text, markdown formatting, or code blocks before or after the JSON. Just return the raw JSON.

The JSON object must have the following structure:
{
  "score": number,                          // Overall score out of 10
  "comment": string,                        // Brief motivational comment
  "what_you_did_well": [                    // List of 3-5 positive feedback points
    "string",
    ...
  ],
  "areas_to_improve": [                     // List of 3-5 improvement suggestions
    "string",
    ...
  ],
  "try_saying_it_like_this": {
    "question": string,                     // The question being improved
    "suggested_answer": string              // Improved response suggestion
  }
}

Make sure your response is parseable as JSON. Do not add any markdown formatting or code block indicators.
    `;

    // Prepare the prompt for Deepseek LLM
    const userPrompt = `
    Analyze the following visa interview transcript and return ONLY a JSON object with your feedback using the exact format specified, with no additional text:

{
  "score": number,                          // Overall score out of 10 (e.g., 7)
  "comment": string,                        // Brief motivational comment
  "what_you_did_well": [                    // List of positive feedback points
    "string",
    ...
  ],
  "areas_to_improve": [                     // List of improvement suggestions
    "string",
    ...
  ],
  "try_saying_it_like_this": {
    "question": string,                     // The question being improved
    "suggested_answer": string              // Improved response suggestion
  }
}

Remember: Only return the JSON object itself. No text before or after, no code blocks, no explanation.

Transcript:
${formattedConversation}
    `;

    // Call Deepseek API
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: response.statusText,
      }));

      return NextResponse.json(
        {
          error: `Failed to analyze conversation: ${
            errorData.error || response.statusText
          }`,
        },
        { status: response.status }
      );
    }

    const analysisResult = await response.json();
    
    try {
      // Parse the LLM JSON response directly
      const llmContent = analysisResult.choices[0].message.content;
      let parsedAnalysis;
      
      // Attempt to parse the JSON from the LLM response
      try {
        // In case the model returns extra text before or after the JSON
        // Find JSON-like content using regex and parse it
        const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          parsedAnalysis = JSON.parse(llmContent);
        }
        
        console.log("Successfully parsed LLM JSON response:", parsedAnalysis);
      } catch (parseError) {
        console.error("Error parsing LLM JSON response:", parseError);
        console.log("Raw LLM response:", llmContent);
        
        // If parsing fails, fall back to the existing extraction method
        parsedAnalysis = null;
      }
      
      // Use the parsed JSON if available, otherwise fall back to the existing method
      if (parsedAnalysis) {
        // Map the JSON structure to the expected analysis format
        const analysis = {
          score: parsedAnalysis.score,
          comment: parsedAnalysis.comment,
          strengths: parsedAnalysis.what_you_did_well || [],
          improvements: parsedAnalysis.areas_to_improve || [],
          specificFeedback: parsedAnalysis.try_saying_it_like_this?.question + ": " + parsedAnalysis.try_saying_it_like_this?.suggested_answer || "",
          fullAnalysis: JSON.stringify(parsedAnalysis, null, 2),
          detailedFeedback: formatDetailedFeedback(parsedAnalysis),
        };
        
        return NextResponse.json({ analysis });
      } else {
        // Fall back to the existing extraction method
        const analysis = {
          overallImpression: extractSection(analysisResult.choices[0].message.content, 'Overall Impression'),
          strengths: extractArrayItems(analysisResult.choices[0].message.content, 'Strengths'),
          areasForImprovement: extractSection(analysisResult.choices[0].message.content, 'Areas for Improvement'),
          specificFeedback: extractSection(analysisResult.choices[0].message.content, 'Specific Feedback'),
          recommendations: extractSection(analysisResult.choices[0].message.content, 'Recommendations'),
          fullAnalysis: analysisResult.choices[0].message.content,
          improvements: extractArrayItems(analysisResult.choices[0].message.content, 'Areas for Improvement'),
          detailedFeedback: analysisResult.choices[0].message.content,
        };
        
        return NextResponse.json({ analysis });
      }
    } catch (processingError) {
      console.error("Error processing LLM response:", processingError);
      
      // Return the raw response as a fallback
      return NextResponse.json({ 
        analysis: { 
          fullAnalysis: analysisResult.choices[0].message.content,
          detailedFeedback: analysisResult.choices[0].message.content
        } 
      });
    }
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}

/**
 * Formats conversation transcript into a readable format for analysis
 */
function formatConversationForAnalysis(transcript: any[]) {
  let formattedText = "";

  transcript.forEach((turn, index) => {
    // Determine role (agent/user)
    const role = turn.role === "agent" ? "Immigration Officer" : "Applicant";
    const message = turn.message || "";

    formattedText += `${role}: ${message}\n\n`;
  });

  return formattedText;
}

/**
 * Extracts a specific section from the analysis text
 */
function extractSection(text: string, sectionName: string) {
  const regex = new RegExp(`${sectionName}:?([\\s\\S]*?)(?=\\d+\\.\\s|$)`, "i");
  const match = text.match(regex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return "";
}

/**
 * Extracts a list of items from a section and returns as an array
 */
function extractArrayItems(text: string, sectionName: string) {
  const sectionText = extractSection(text, sectionName);
  if (!sectionText) return [];

  // Split by bullet points, asterisks, or numbered items
  const items = sectionText
    .split(/[\n\r]+\s*[-•*]\s*|\n\r+\s*\d+\.\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : [sectionText]; // If no bullet points found, return the entire text as a single item
}

/**
 * Formats the parsed analysis into a human-readable detailed feedback
 */
function formatDetailedFeedback(parsedAnalysis: any) {
  if (!parsedAnalysis) return "";
  
  let detailedFeedback = `## Visa Interview Analysis\n\n`;
  
  // Add overall score and comment
  if (parsedAnalysis.score !== undefined) {
    detailedFeedback += `**Overall Score: ${parsedAnalysis.score}/10**\n\n`;
  }
  
  if (parsedAnalysis.comment) {
    detailedFeedback += `${parsedAnalysis.comment}\n\n`;
  }
  
  // Add strengths
  if (parsedAnalysis.what_you_did_well && parsedAnalysis.what_you_did_well.length > 0) {
    detailedFeedback += `### What You Did Well:\n\n`;
    parsedAnalysis.what_you_did_well.forEach((strength: string) => {
      detailedFeedback += `• ${strength}\n`;
    });
    detailedFeedback += `\n`;
  }
  
  // Add areas to improve
  if (parsedAnalysis.areas_to_improve && parsedAnalysis.areas_to_improve.length > 0) {
    detailedFeedback += `### Areas to Improve:\n\n`;
    parsedAnalysis.areas_to_improve.forEach((area: string) => {
      detailedFeedback += `• ${area}\n`;
    });
    detailedFeedback += `\n`;
  }
  
  // Add specific improvement suggestion
  if (parsedAnalysis.try_saying_it_like_this) {
    detailedFeedback += `### Try Saying It Like This:\n\n`;
    detailedFeedback += `**Question:** ${parsedAnalysis.try_saying_it_like_this.question}\n\n`;
    detailedFeedback += `**Suggested Answer:** ${parsedAnalysis.try_saying_it_like_this.suggested_answer}\n\n`;
  }
  
  return detailedFeedback;
}
