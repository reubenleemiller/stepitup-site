exports.handler = async function (event, context) {
  // Use native fetch in Node 18+ or dynamic import if needed
  const fetch = global.fetch || (await import("node-fetch")).default;

  const API_KEY = process.env.CAL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing CAL_API_KEY env variable" }),
    };
  }

  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Parse query params or use defaults
  const queryParams = event.queryStringParameters || {};
  const username = "rebeccamiller";   // your username
  const eventTypeSlug = "60min-check"; // your event slug
  const start = queryParams.start || new Date().toISOString().slice(0, 10); // YYYY-MM-DD today
  const end = queryParams.end || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // +14 days
  const timeZone = queryParams.timeZone || "America/Chicago";

  // Build URL with search params
  const url = new URL("https://api.cal.com/v2/slots");
  url.searchParams.set("username", username);
  url.searchParams.set("eventTypeSlug", eventTypeSlug);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);
  url.searchParams.set("timeZone", timeZone);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const text = await response.text();
    console.log("Raw Cal.com API response:", text);

    if (!response.ok) {
      console.error("Cal.com API error:", response.status, text);
      return {
        statusCode: response.status,
        body: text,
      };
    }

    const data = JSON.parse(text);

    // Return the raw slots data to frontend to parse & display
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
