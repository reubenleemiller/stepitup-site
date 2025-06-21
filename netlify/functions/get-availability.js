const fetch = require("node-fetch");

const CAL_API_KEY = process.env.CAL_API_KEY;
const USERNAME = "rebeccamiller";
const SLUG = "60min-check";
const TIMEZONE = "America/Chicago";
const START_DATE = "2025-06-21";
const END_DATE = "2025-07-05";

async function getEventTypeId(username, slug) {
  const url = `https://api.cal.com/v2/event-types?username=${username}`;

  console.info("Fetching event types for:", username);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch event types:", res.status);
    const err = await res.text();
    console.error(err);
    throw new Error("Failed to fetch event types");
  }

  const data = await res.json();
  const match = data.find((event) => event.slug === slug);
  if (!match) {
    console.error("Event type slug not found:", slug);
    throw new Error("Event type not found");
  }

  console.info("Found eventTypeId:", match.id);
  return match.id;
}

async function getAvailability(eventTypeId) {
  const url = "https://api.cal.com/v2/booking/slots";
  const body = {
    eventTypeId,
    startDate: START_DATE,
    endDate: END_DATE,
    timeZone: TIMEZONE,
  };

  console.info("Requesting availability with payload:", JSON.stringify(body));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  console.info("Raw Cal.com API response:", raw);

  if (!res.ok) {
    console.error("Cal.com API error:", res.status, raw);
    throw new Error("Failed to fetch availability");
  }

  const data = JSON.parse(raw);
  console.info("Available slots:", data);
  return data;
}

async function main() {
  try {
    const eventTypeId = await getEventTypeId(USERNAME, SLUG);
    const slots = await getAvailability(eventTypeId);

    // You can render or use slots here
    console.log("Success:", slots);
  } catch (err) {
    console.error("Unhandled error:", err.message);
  }
}

main();
