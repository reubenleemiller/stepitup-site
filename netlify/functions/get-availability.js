exports.handler = async function (event, context) {
  console.log("Received request to get availability");

  const API_KEY = process.env.CAL_API_KEY;

  if (!API_KEY) {
    console.error("Missing CAL_API_KEY in environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfigured: missing API key" }),
    };
  }

  const params = {
    username: "rebeccamiller",
    eventType: "60min-check",
    start: "2025-06-21",
    end: "2025-07-05",
    timeZone: "America/Chicago",
  };

  const query = new URLSearchParams(params).toString();
  const url = `https://api.cal.com/v2/availability?${query}`;

  console.log("Constructed URL:", url);

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(url, {
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

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Exception thrown while calling Cal.com API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
