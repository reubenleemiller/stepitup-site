exports.handler = async function (event, context) {
  console.log("Received request to get availability");

  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const startDate = `${yyyy}-${mm}-${dd}`;

  // Set end date 2 weeks from today (optional)
  const endDateObj = new Date();
  endDateObj.setDate(endDateObj.getDate() + 14);
  const yyyyEnd = endDateObj.getFullYear();
  const mmEnd = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const ddEnd = String(endDateObj.getDate()).padStart(2, '0');
  const endDate = `${yyyyEnd}-${mmEnd}-${ddEnd}`;

  // Use query params instead of body for GET
  const params = new URLSearchParams({
    username: 'rebeccamiller',
    eventTypeSlug: '60min-check',
    start: startDate,
    end: endDate,
    timeZone: 'America/Chicago'
  });

  const url = `https://api.cal.com/v2/slots?${params.toString()}`;

  console.log("Constructed URL:", url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`
      }
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
