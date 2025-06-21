export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { username, eventTypeSlug, start, end, timeZone } = body;
  if (!username || !eventTypeSlug || !start || !end || !timeZone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing parameters' }),
    };
  }

  const API_KEY = process.env.CAL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API key' }),
    };
  }

  const url = new URL('https://api.cal.com/v2/slots');
  url.searchParams.append('username', username);
  url.searchParams.append('eventTypeSlug', eventTypeSlug);
  url.searchParams.append('start', start);
  url.searchParams.append('end', end);
  url.searchParams.append('timeZone', timeZone);

  try {
    // Dynamic import for node-fetch ESM compatibility
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
