export async function handler(event) {
  const { username, eventTypeSlug, start, end, timeZone } = JSON.parse(event.body);

  console.log('Received request to get availability');

  const baseURL = 'https://api.cal.com/v1/slots';
  const url = new URL(baseURL);
  url.searchParams.append('username', username);
  url.searchParams.append('eventTypeSlug', eventTypeSlug);
  url.searchParams.append('start', start);
  url.searchParams.append('end', end);
  url.searchParams.append('timeZone', timeZone);

  console.log('Constructed URL:', url.toString());

  const fetch = (await import('node-fetch')).default;

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
        Accept: 'application/json',
      },
    });
    const data = await response.json();

    console.log('Raw Cal.com API response:', JSON.stringify(data));

    if (!response.ok) {
      console.error('Cal.com API error:', response.status, data);
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
    console.error('Fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
