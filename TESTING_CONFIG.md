# Testing Configuration

## Live Stream Time Restriction

For testing and debugging purposes, you can disable the 15-minute wait restriction before joining live streams.

### To Disable the Restriction (for testing):

1. In your `.env.local` file, set:
   ```
   VITE_DISABLE_STREAM_TIME_RESTRICTION=true
   ```

2. Restart your development server

3. You'll see a warning indicator in the UI when the restriction is disabled

### To Re-enable the Restriction (for production):

1. In your `.env.local` file, either:
   - Set `VITE_DISABLE_STREAM_TIME_RESTRICTION=false`
   - Or remove the line entirely

2. Restart your development server

### Default Behavior

When the restriction is enabled (default):
- Users can join live streams 15 minutes before the scheduled session time
- Users can join during the session (up to the session duration after start time)

When the restriction is disabled (testing mode):
- Users can join live streams at any time
- A warning indicator shows that time restriction is disabled