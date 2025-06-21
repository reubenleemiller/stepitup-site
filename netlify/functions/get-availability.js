const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.CAL_API_KEY;

  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 2 weeks out

  const res = await fetch('https://api.cal.com/v1/availability/time-slots', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: "rebeccamiller", // your cal.com username
      start: startDate,
      end: endDate,
      duration: 60
    })
  });

  if (!res.ok) {
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: "Failed to fetch availability" })
    };
  }

  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
