# Community Circles - Quick Start Guide

## For Users

### Creating a Circle
1. Go to Community tab
2. Click "Create Circle"
3. Fill in:
   - Name and description
   - Choose Public or Private
   - Choose Free or Paid
   - Set posting permissions
   - Add optional tags
4. Click "Create Circle"

### Joining a Circle
**Public Circle:**
1. Browse circles
2. Click on a circle card
3. Click "Join Circle"

**Private Circle:**
1. Get invite code from circle admin
2. Enter code when prompted
3. Join circle

### Using Chat
1. Open circle from "My Circles"
2. Type message in input box
3. Press Enter or click send
4. React with emojis by clicking smile icon
5. Reply by clicking reply icon

### Managing Members (Admins)
1. Open circle details
2. Click "Members"
3. Click menu (⋮) on member
4. Choose action:
   - Make Admin/Moderator
   - Remove from circle
   - Ban from circle

### Creating Expert Requests (Admins)
1. Open circle details
2. Click "Expert Requests"
3. Click "Create Request"
4. Fill in details and budget
5. Review applications
6. Accept an application
7. Mark as completed when done

## For Developers

### Adding Circle Features to Your App

```typescript
import { CommunityTab } from './components/CommunityTab';

function App() {
  return <CommunityTab />;
}
```

### Using Circle Components Individually

```typescript
// Circle creation
import { CircleCreationForm } from './components/CircleCreationForm';

<CircleCreationForm
  onSuccess={(circleId) => console.log('Created:', circleId)}
  onCancel={() => console.log('Cancelled')}
/>

// Circle chat
import { CircleChatInterface } from './components/CircleChatInterface';

<CircleChatInterface
  circleId={circleId}
  onBack={() => navigate('back')}
/>

// Member management
import { CircleMembersView } from './components/CircleMembersView';

<CircleMembersView
  circleId={circleId}
  onBack={() => navigate('back')}
/>

// Expert requests
import { ExpertRequestsView } from './components/ExpertRequestsView';

<ExpertRequestsView
  circleId={circleId}
  onBack={() => navigate('back')}
/>
```

### Backend Queries

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

// Get circle details
const circle = useQuery(api.circles.getCircleById, { circleId });

// Get messages
const messages = useQuery(api.circleMessages.getMessages, {
  circleId,
  limit: 50
});

// Get members
const members = useQuery(api.circleMembers.getCircleMembers, {
  circleId,
  limit: 100
});

// Get expert requests
const requests = useQuery(api.expertRequests.getCircleExpertRequests, {
  circleId
});
```

### Backend Mutations

```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Create circle
const createCircle = useMutation(api.circles.createCircle);
await createCircle({
  name: 'My Circle',
  description: 'A great community',
  type: 'PUBLIC',
  accessType: 'FREE',
  postingPermission: 'EVERYONE'
});

// Send message
const sendMessage = useMutation(api.circleMessages.sendMessage);
await sendMessage({
  circleId,
  messageType: 'text',
  content: 'Hello world!'
});

// Add reaction
const addReaction = useMutation(api.circleMessages.addReaction);
await addReaction({
  messageId,
  emoji: '👍'
});

// Update member role
const updateRole = useMutation(api.circleMembers.updateMemberRole);
await updateRole({
  circleId,
  memberId,
  newRole: 'ADMIN'
});
```

### Common Patterns

#### Check if user is admin
```typescript
const circle = useQuery(api.circles.getCircleById, { circleId });
const isAdmin = circle?.membership && 
  ['CREATOR', 'ADMIN'].includes(circle.membership.role);
```

#### Check if user can post
```typescript
const canPost = circle?.canPost; // Calculated in backend
```

#### Handle errors
```typescript
try {
  await mutation({ ...args });
} catch (error: any) {
  alert(error.message || 'Operation failed');
}
```

## Troubleshooting

### "Not authenticated" error
- User must be logged in
- Check auth state before operations

### "You must be a member" error
- User needs to join circle first
- Check `circle.isMember` before showing features

### "Only admins can..." error
- Check user role before showing admin features
- Use `isAdmin` check in UI

### Messages not appearing
- Check if user is a member
- Verify posting permissions
- Check for errors in console

### Can't join circle
- Check if circle is full
- Verify invite code for private circles
- Check if already a member

## Best Practices

### Performance
- Use pagination for large lists
- Implement infinite scroll for messages
- Lazy load images and avatars

### UX
- Show loading states
- Provide clear error messages
- Confirm destructive actions
- Auto-scroll to new messages

### Security
- Always check permissions on backend
- Validate all inputs
- Use role-based access control
- Sanitize user content

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Provide alt text for images

## Next Steps

1. **Test the features** in development
2. **Integrate payments** for paid circles
3. **Add notifications** for new messages
4. **Implement file uploads** for rich media
5. **Add audio/video rooms** with LiveKit

## Resources

- [Full Documentation](./COMMUNITY_CIRCLES_FINAL_IMPLEMENTATION.md)
- [Convex Documentation](https://docs.convex.dev)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For issues or questions:
1. Check this guide
2. Review full documentation
3. Check component source code
4. Test in development environment
5. Review Convex dashboard logs
