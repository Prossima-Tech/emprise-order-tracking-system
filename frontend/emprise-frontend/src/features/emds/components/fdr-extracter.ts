// FDR Data Extraction Utility
import Tesseract from 'tesseract.js';

interface ExtractedFDRData {
  amount: number | null;
  maturityDate: string | null;
  submissionDate: string | null;
  bankName: string;
}

export async function extractFDRData(imageFile: File): Promise<ExtractedFDRData> {
  try {
    // OCR with Tesseract
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      { logger: m => console.log(m) }
    );

    const text = result.data.text;
    console.log('Raw extracted text:', text);

    // Prepare prompt for DeepSeek-R1
    const prompt = `Extract these fields as JSON ONLY from the text:
    {
      "amount": written in numbers below the text Maturity value in float value,
      "maturityDate": "DD-MM-YYYY",
      "submissionDate": "DD-MM-YYYY"
    }
    Return ONLY valid JSON without any formatting or explanations and if you encounter two amounts then provide the amount which has higher value. Text: ${text}`;

    // Call DeepSeek-R1 API
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'Emprise'
      },
      body: JSON.stringify({
        model: "qwen/qwen-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`DeepSeek API error: ${await apiResponse.text()}`);
    }

    const responseData = await apiResponse.json();
    const llmResponse = responseData.choices[0].message.content;
    console.log('DeepSeek Response:', llmResponse);

    // Parse and validate response
    let parsedData: Partial<ExtractedFDRData>;
    try {
      // Clean the response by removing Markdown formatting
      const sanitizedResponse = llmResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
        
      parsedData = JSON.parse(sanitizedResponse);
    } catch (e) {
      console.error('Failed to parse response:', llmResponse);
      throw new Error('Failed to parse DeepSeek response. Please try again.');
    }

    // Build final result
    const extractedData: ExtractedFDRData = {
      amount: validateNumber(parsedData.amount),
      maturityDate: validateDate(parsedData.maturityDate),
      submissionDate: validateDate(parsedData.submissionDate),
      bankName: 'IDBI' // Directly set since we're not extracting this
    };

    console.log('Final extracted data:', extractedData);
    return extractedData;

  } catch (error) {
    console.error('Error in FDR data extraction:', error);
    return {
      amount: null,
      maturityDate: null,
      submissionDate: null,
      bankName: 'IDBI'
    };
  }
}

// Helper functions
function validateDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(datePattern);
  if (!match) return null;

  const [_, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}`);
  return date.toString() === 'Invalid Date' ? null : dateStr;
}

function validateNumber(num: number | null | undefined): number | null {
  if (typeof num !== 'number' || isNaN(num)) return null;
  return num > 0 ? num : null;
}