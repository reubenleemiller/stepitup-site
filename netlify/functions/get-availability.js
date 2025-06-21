exports.handler = async function (event, context) {
  const fetch = (await import("node-fetch")).default;
  const API_KEY = process.env.CAL_API_KEY;

  // Accept start param from query string for flexibility
  const start = event.queryStringParameters?.start || new Date().toISOString().split("T")[0];

  // You can check the HTTP method if you want
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

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

    if (!response.ok) {
      const text = await response.text();
      console.error("Cal.com API error:", text);
      return {
        statusCode: response.status,
        body: text,
      };
    }

    const json = await response.json();

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
