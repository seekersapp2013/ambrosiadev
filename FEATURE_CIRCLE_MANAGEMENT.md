# Feature: Circle Management & Settings

## Overview
Comprehensive circle management features including settings editing, message deletion, and circle deletion with proper permissions.

## Features Implemented

### 1. Circle Settings View (`CircleSettingsView.tsx`)

A complete settings interface for circle administrators with the following sections:

#### Basic Information (Editable)
- Circle name
- Description
- Maximum members (with validation against current member count)
- Tags (comma-separated)

#### Circle Type (Read-Only)
- Visibility (Public/Private) - Cannot be changed after creation
- Access (Free/Paid) - Cannot be changed after creation
- Clear warning messages explaining why these can't be changed

#### Posting Permissions (Editable)
- Everyone: All members can post messages
- Admins Only: Only admins/moderators can post
- Visual toggle with icons and descriptions

#### Invite Code (Private Circles Only)
- Display invite code for private circles
- Copy to clipboard functionality
- Highlighted in purple theme

#### Danger Zone (Creator Only)
- Delete circle button
- Confirmation modal with name verification
- Clear warning about permanent deletion

### 2. Message Deletion

#### Who Can Delete
- **Message Author**: Can delete their own messages
- **Admins/Moderators**: Can delete any message
- **Creators**: Can delete any message

#### UI Features
- Delete button appears on hover
- Red color to indicate destructive action
- Confirmation dialog before deletion
- Tooltip showing "Delete message"

### 3. Circle Deletion

#### Permissions
- Only the circle creator can delete the circle
- Admins cannot delete circles (only creators)

#### Safety Features
- Two-step confirmation process:
  1. Click "Delete Circle" button
  2. Type exact circle name to confirm
- Clear warning about permanent deletion
- Lists what will be deleted:
  - The circle itself
  - All messages
  - All member associations

#### After Deletion
- User is redirected to "My Circles" view
- Success message displayed
- Circle is soft-deleted (marked as inactive)

## User Interface

### Settings Access
- Settings icon (⚙️) in circle detail header
- Only visible to admins and creators
- Opens full settings view

### Edit Mode
- "Edit" button to enter edit mode
- Form fields become editable
- "Save Changes" and "Cancel" buttons appear
- Cancel restores original values

### Visual Indicators
- Read-only fields have warning icons (⚠️)
- Danger zone has red theme
- Success actions use accent color
- Destructive actions use red color

## Permissions Matrix

| Action | Creator | Admin | Moderator | Member |
|--------|---------|-------|-----------|--------|
| View Settings | ✅ | ✅ | ❌ | ❌ |
| Edit Basic Info | ✅ | ✅ | ❌ | ❌ |
| Edit Posting Permissions | ✅ | ✅ | ❌ | ❌ |
| Delete Circle | ✅ | ❌ | ❌ | ❌ |
| Delete Own Messages | ✅ | ✅ | ✅ | ✅ |
| Delete Any Message | ✅ | ✅ | ✅ | ❌ |
| Pin Messages | ✅ | ✅ | ✅ | ❌ |

## Backend Integration

### Mutations Used
- `updateCircle` - Update circle settings
- `deleteCircle` - Soft delete circle
- `deleteMessage` - Delete message

### Validation
- Name and description required
- Max members must be >= current members
- Only creator can delete circle
- Only sender or admin can delete message

## Navigation Flow

```
Circle Detail View
└── Settings Icon (⚙️)
    └── Circle Settings View
        ├── Edit Mode
        │   ├── Save Changes → Back to Settings
        │   └── Cancel → Back to Settings
        └── Delete Circle
            └── Confirmation Modal
                ├── Confirm → My Circles
                └── Cancel → Back to Settings
```

## Technical Details

### State Management
```typescript
const [isEditing, setIsEditing] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteConfirmText, setDeleteConfirmText] = useState('');
const [formData, setFormData] = useState({...});
```

### Form Validation
- Name and description cannot be empty
- Max members validated against current count
- Circle name must match exactly for deletion
- Tags are split by comma and trimmed

### Error Handling
- Try-catch blocks for all mutations
- User-friendly error messages
- Alert dialogs for feedback
- Form reset on cancel

## UI Components

### Settings Sections
1. **Header** - Title, back button, edit button
2. **Basic Information** - Editable fields
3. **Circle Type** - Read-only with warnings
4. **Posting Permissions** - Toggle buttons
5. **Invite Code** - Copy functionality (private only)
6. **Danger Zone** - Delete button (creator only)

### Modals
- **Delete Confirmation** - Name verification required
- **Success/Error Alerts** - User feedback

## Styling

### Color Scheme
- **Accent**: Primary actions (save, edit)
- **Red**: Destructive actions (delete)
- **Purple**: Private circle features
- **Green**: Public circle features
- **Gray**: Neutral/disabled states

### Responsive Design
- Mobile-friendly layout
- Touch-friendly buttons
- Proper spacing and padding
- Scrollable content areas

## Testing Checklist

### Settings View
- [x] Access settings as creator
- [x] Access settings as admin
- [x] Blocked access as member
- [x] Edit basic information
- [x] Save changes successfully
- [x] Cancel editing restores values
- [x] Update posting permissions
- [x] View invite code (private circles)
- [x] Copy invite code

### Message Deletion
- [x] Delete own message
- [x] Delete as admin
- [x] Delete button only shows for authorized users
- [x] Confirmation dialog appears
- [x] Message removed from chat

### Circle Deletion
- [x] Delete button only for creator
- [x] Confirmation modal appears
- [x] Name verification required
- [x] Successful deletion redirects
- [x] Circle marked as inactive

## Security Considerations

### Backend Validation
- All permissions checked on backend
- User authentication required
- Role verification for actions
- Soft deletes for data retention

### Frontend Protection
- UI elements hidden based on permissions
- Confirmation dialogs for destructive actions
- Name verification for critical actions
- Clear warning messages

## Future Enhancements

### Potential Features
1. **Transfer Ownership** - Allow creator to transfer to another admin
2. **Archive Circle** - Temporary deactivation instead of deletion
3. **Bulk Actions** - Delete multiple messages at once
4. **Edit History** - Track changes to circle settings
5. **Restore Deleted** - Undo circle deletion within timeframe
6. **Export Data** - Download circle messages before deletion
7. **Schedule Deletion** - Set future deletion date
8. **Member Notifications** - Notify members of setting changes

## Related Files
- `src/components/CircleSettingsView.tsx` - Settings interface
- `src/components/CircleChatInterface.tsx` - Message deletion
- `src/components/CircleDetailView.tsx` - Settings access
- `src/components/CommunityTab.tsx` - Navigation integration
- `convex/circles.ts` - Backend mutations
- `convex/circleMessages.ts` - Message operations

## Impact
- ✅ Full circle management capabilities
- ✅ Proper permission controls
- ✅ User-friendly interface
- ✅ Safe deletion workflows
- ✅ Comprehensive settings
- ✅ Professional UX

## Notes
- Circle type and access type are intentionally read-only after creation to prevent confusion and maintain data integrity
- Soft deletes are used for circles to allow potential recovery and maintain referential integrity
- Message deletion is permanent (soft delete in backend)
- All destructive actions require confirmation
