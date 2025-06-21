// netlify/functions/get-availability.js
exports.handler = async function(event, context) {
  // Allow only GET or POST requests
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Dynamic import for node-fetch (ESM)
  const fetch = (await import("node-fetch")).default;

  const API_KEY = process.env.CAL_API_KEY;

  // Use start date query param or default to today (YYYY-MM-DD)
  const start = event.queryStringParameters?.start || new Date().toISOString().split("T")[0];

  // GraphQL query to fetch availability
  const query = `
    query {
      availability(
        username: "rebeccamiller"
        eventTypeSlug: "60min-check"
        days: 14
        timezone: "America/Chicago"
        startDate: "${start}"
      ) {
        date
        slots
      }
    }
  `;

  try {
    const response = await fetch("https://api.cal.com/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    const text = await response.text();
    console.log("Raw API response:", text);

    if (!response.ok) {
      console.error(`Cal.com API returned error status: ${response.status}`);
      return {
        statusCode: response.status,
        body: text,
      };
    }

    let json;
    try {
      json = JSON.parse(text);
      console.log("Parsed API response:", json);
    } catch (parseError) {
      console.error("Failed to parse API response JSON:", parseError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to parse API response" }),
      };
    }

    if (!json.data || !json.data.availability) {
      console.error("API response missing 'data.availability' field");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Malformed API response" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(json.data.availability),
    };

  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
