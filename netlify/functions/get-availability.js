exports.handler = async function (event, context) {
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

  const start = "2025-06-21";
  const end = "2025-07-05";
  const timeZone = "America/Chicago";

  const payload = {
    username: "rebeccamiller",
    eventTypeSlug: "60min-check",
    start,
    end,
    timeZone,
  };

  try {
    const response = await fetch("https://api.cal.com/v2/slots", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
