import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

async function getCoordinates(destination: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`, {
      headers: { "User-Agent": "SmartTripPlannerFallback/1.0" }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding failed", e);
  }
  // Default fallback if openstreetmap fails
  return { lat: 40.7128, lng: -74.0060 }; // NYC
}

export async function POST(req: Request) {
  try {
    const { destination, days, budget, interests, currency } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE";
    
    let ai: any = null;
    if (hasValidKey) {
        ai = new GoogleGenAI({ apiKey });
    }

    // Prepare fallback data using real OpenStreetMap geocoding so the map goes to the correct city!
    const baseCoords = await getCoordinates(destination);
    
    const fallbackMockData = {
      summary: {
        stay_options: [
          { type: 'Budget', name: `Budget Stay in ${destination}`, area: `Central ${destination}`, cost_per_night: Math.floor((budget * 0.1)/days), description: 'Affordable and central.' },
          { type: 'Standard', name: `Standard Hotel in ${destination}`, area: `Central ${destination}`, cost_per_night: Math.floor((budget * 0.2)/days), description: 'Comfortable and clean.' },
          { type: 'Luxury', name: `Luxury Resort in ${destination}`, area: `Premium ${destination}`, cost_per_night: Math.floor((budget * 0.4)/days), description: 'High-end premium resort.' },
        ],
        estimated_food_cost: Math.floor(budget * 0.3),
        estimated_travel_cost: Math.floor(budget * 0.1),
        estimated_activities_cost: Math.floor(budget * 0.15),
        special_recommendations: {
          food_to_try: [
            { name: `Local Seafood in ${destination}`, average_price: Math.floor(budget * 0.05) },
            { name: `Famous street snacks`, average_price: Math.floor(budget * 0.02) }
          ],
          special_activities: [`Surfing at local beaches`, `Night market shopping`],
          cultural_notes: `Immerse yourself in the rich local history of ${destination}.`
        }
      },
      days: Array.from({ length: days }, (_, i) => ({
        day_number: i + 1,
        total_daily_cost: Math.floor((budget * 0.55) / days),
        activities: [
          {
            name: `Morning Historic Tour - ${destination}`,
            description: `Explore the local culture and start checking out everything related to ${interests[0] || 'your interests'}.`,
            start_time: "09:00 AM",
            end_time: "11:30 AM",
            visit_duration_minutes: 150,
            travel_time_to_next_minutes: 15,
            cost: Math.floor(budget * 0.05 / days),
            coordinates: { lat: baseCoords.lat + (Math.random()*0.02 - 0.01), lng: baseCoords.lng + (Math.random()*0.02 - 0.01) }
          },
          {
            name: `Central Dining & Relaxing`,
            description: `Take a break around the main square and enjoy some iconic local cuisine.`,
            start_time: "11:45 AM",
            end_time: "03:00 PM",
            visit_duration_minutes: 195,
            travel_time_to_next_minutes: 20,
            cost: Math.floor(budget * 0.1 / days),
            coordinates: { lat: baseCoords.lat + (Math.random()*0.02 - 0.01), lng: baseCoords.lng + (Math.random()*0.02 - 0.01) }
          },
          {
            name: `Evening Scenic Views & Nightlife`,
            description: `Wind down for the evening and experience the vibrant scenic atmosphere of ${destination}.`,
            start_time: "03:20 PM",
            end_time: "08:00 PM",
            visit_duration_minutes: 280,
            travel_time_to_next_minutes: 0,
            cost: Math.floor(budget * 0.15 / days),
            coordinates: { lat: baseCoords.lat + (Math.random()*0.02 - 0.01), lng: baseCoords.lng + (Math.random()*0.02 - 0.01) }
          }
        ]
      }))
    };

    if (!hasValidKey) {
        console.warn("Using fallback geocoded mock data because GEMINI_API_KEY is invalid/missing.");
        return NextResponse.json(fallbackMockData);
    }

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.OBJECT,
          properties: {
            stay_options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  area: { type: Type.STRING },
                  cost_per_night: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["type", "name", "area", "cost_per_night", "description"]
              }
            },
            estimated_food_cost: { type: Type.NUMBER },
            estimated_travel_cost: { type: Type.NUMBER },
            estimated_activities_cost: { type: Type.NUMBER },
            special_recommendations: {
              type: Type.OBJECT,
              properties: {
                food_to_try: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      average_price: { type: Type.NUMBER }
                    },
                    required: ["name", "average_price"]
                  } 
                },
                special_activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                cultural_notes: { type: Type.STRING }
              },
              required: ["food_to_try", "special_activities", "cultural_notes"]
            }
          },
          required: ["stay_options", "estimated_food_cost", "estimated_travel_cost", "estimated_activities_cost", "special_recommendations"],
        },
        days: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day_number: { type: Type.INTEGER },
              total_daily_cost: { type: Type.NUMBER },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    start_time: { type: Type.STRING },
                    end_time: { type: Type.STRING },
                    visit_duration_minutes: { type: Type.INTEGER },
                    travel_time_to_next_minutes: { type: Type.INTEGER },
                    cost: { type: Type.NUMBER },
                    coordinates: {
                      type: Type.OBJECT,
                      properties: {
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER }
                      },
                      required: ["lat", "lng"]
                    }
                  },
                  required: ["name", "description", "start_time", "end_time", "visit_duration_minutes", "travel_time_to_next_minutes", "cost", "coordinates"],
                }
              }
            },
            required: ["day_number", "total_daily_cost", "activities"],
          }
        }
      },
      required: ["summary", "days"],
    };

    const prompt = `You are an expert travel planner with access to live Google Search functionality. You must create a highly realistic budget trip based on current real-world pricing constraints.
Destination: ${destination}
Days: ${days}
Total Budget: ${budget} ${currency}
Interests: ${interests.join(", ")}

Requirements:
- Plan a day-by-day itinerary prioritizing shortest route, low travel cost, and realistic timing.
- **CRITICAL: Fetch recent data for current average hotel rates, meal costs, and ticket entry prices for ${destination}. Base your calculations on CURRENT market rates rather than historical estimations.**
- Provide exactly 3 stay_options (Budget, Standard, Luxury) with their individual cost_per_night indicating the resort fee or hotel price. 
- Ensure the non-hotel base costs (food, travel, activities) leave enough budget for the standard stay_option.
- Include a list of special favourite foods, sports/activities, and other unique regional must-dos in special_recommendations.
- All costs MUST be estimated in the local unit of ${currency}.
- Group nearby attractions to reduce travel time.
- Provide approximate real-world coordinates (latitude and longitude) for each activity.
- Output MUST be structured JSON according to the schema provided. DO NOT include markdown backticks like \`\`\`json. Valid JSON only!
`;

    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: schema,
          }
      });
      
      if (!response.text) {
          throw new Error("No response body from AI");
      }

      // Safely parse JSON by removing potential markdown backticks that Gemini sometimes injects
      let cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return NextResponse.json(JSON.parse(cleanText));
    } catch (error) {
      console.error("AI Generation failed. Serving geographic fallback data.", error);
      return NextResponse.json(fallbackMockData);
    }

  } catch (error: any) {
    console.error("API error", error);
    return NextResponse.json({ error: error.message || "Failed to parse request." }, { status: 500 });
  }
}
