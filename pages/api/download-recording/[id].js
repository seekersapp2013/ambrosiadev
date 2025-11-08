export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  // This endpoint should not be used directly
  // Instead, users should use the downloadRecording mutation from the frontend
  // which handles authentication and generates proper download URLs
  
  return res.status(400).json({ 
    error: 'Direct download not supported. Please use the download button in the application.',
    code: 'USE_APP_DOWNLOAD'
  });
}