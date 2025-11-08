# LiveKit Integration Setup

This document explains how to set up LiveKit for live streaming in the Ambrosia booking system.

## Features

- **Live Streaming**: Real-time video/audio sessions for 1-on-1 and group bookings
- **Recording**: Automatic recording of live sessions
- **Reels Integration**: Upload recorded sessions to the reels feature
- **Join Controls**: Easy join buttons in the booking management interface

## Quick Setup (Development)

### 1. Install LiveKit Server

```bash
# Download LiveKit server
curl -sSL https://get.livekit.io | bash

# Or using Docker
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server --dev
```

### 2. Environment Variables

The following environment variables are already configured in `.env.local`:

```env
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_WS_URL=ws://localhost:7880
```

### 3. Start LiveKit Server

```bash
# Start the server with development settings
livekit-server --dev
```

## Production Setup

### 1. LiveKit Cloud (Recommended)

1. Sign up at [LiveKit Cloud](https://cloud.livekit.io)
2. Create a new project
3. Get your API key and secret
4. Update environment variables:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

### 2. Self-Hosted

For production self-hosting, refer to the [LiveKit deployment guide](https://docs.livekit.io/deploy/).

## How It Works

### 1. Booking Creation
- When a booking is created, a unique LiveKit room is automatically generated
- Room name format: `booking-{clientId}-{providerId}-{timestamp}` for 1-on-1
- Room name format: `event-{eventId}-{timestamp}` for group events

### 2. Joining Sessions
- Users can join live sessions 15 minutes before the scheduled time
- Join button appears in the "My Bookings" section
- Automatic access token generation with appropriate permissions

### 3. Recording
- Providers can start/stop recording during live sessions
- Recordings are automatically saved with unique identifiers
- Recording URLs are stored in the booking record

### 4. Reels Integration
- Providers can upload recorded sessions to the reels feature
- Upload modal allows adding title, description, and tags
- Recordings become discoverable content for other users

## User Interface

### Booking Management
- **Join Live Session** button appears for confirmed bookings within the time window
- Live indicator shows when sessions are active
- Recording status is displayed for completed sessions

### Live Stream Room
- Video grid layout for participants
- Camera and microphone controls
- Recording controls (provider only)
- Leave session functionality

### Recording Management
- Dedicated section for managing recorded sessions
- Upload to reels functionality
- Download links for recordings

## API Functions

### LiveKit Functions (`convex/livekit.ts`)

- `createLiveStreamRoom`: Creates a new LiveKit room for a booking
- `generateAccessToken`: Generates JWT token for room access
- `updateStreamStatus`: Updates live stream status
- `startRecording`: Initiates session recording
- `stopRecording`: Stops recording and gets download URL
- `uploadRecordingToReels`: Uploads recording to reels feature

### Usage Examples

```typescript
// Join a live session
const tokenData = await generateAccessToken({
  bookingId: "booking_id",
  participantName: "User Name"
});

// Start recording (provider only)
await startRecording({ bookingId: "booking_id" });

// Upload to reels
await uploadRecordingToReels({
  bookingId: "booking_id",
  title: "My Session Recording",
  description: "Great learning session",
  tags: ["tutorial", "live"],
  isPublic: true
});
```

## Security

- Access tokens are generated with appropriate permissions
- Only booking participants can join sessions
- Recording controls are limited to providers
- Room names are unique and unpredictable

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if LiveKit server is running and accessible
2. **No Video/Audio**: Verify browser permissions for camera/microphone
3. **Recording Not Working**: Ensure provider has recording permissions
4. **Token Expired**: Tokens are valid for the session duration

### Debug Mode

Enable debug logging by setting:
```env
LIVEKIT_LOG_LEVEL=debug
```

## Next Steps

1. **TURN Server**: Configure TURN servers for better connectivity
2. **Webhooks**: Set up webhooks for recording completion notifications
3. **Analytics**: Implement session analytics and metrics
4. **Mobile Support**: Test and optimize for mobile devices
5. **Bandwidth Optimization**: Configure adaptive streaming settings

## Support

For LiveKit-specific issues, refer to:
- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit GitHub](https://github.com/livekit/livekit)
- [LiveKit Discord](https://discord.gg/livekit)