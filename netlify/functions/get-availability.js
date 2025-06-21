exports.handler = async function (event, context) {
  console.log("Received request to get availability");

  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const dd = String(today.getDate()).padStart(2, '0');
  const startDate = `${yyyy}-${mm}-${dd}`;

  const body = JSON.parse(event.body || "{}");

  const payload = {
    username: body.username || "rebeccamiller",
    eventTypeSlug: body.eventTypeSlug || "60min-check",
    start: startDate, // <-- use dynamic today date here
    end: body.end || "2025-07-05", // you can also dynamically set end if you want
    timeZone: body.timeZone || "America/Chicago"
  };

  console.log("Sending payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch("https://api.cal.com/v2/availability/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Raw Cal.com API response:", text);

    if (!res.ok) {
      console.error("Cal.com API error:", res.status, text);
      return {
        statusCode: res.status,
        body: text
      };
    }

    const data = JSON.parse(text);

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
};
