# Components Directory Analysis

## Directory Structure
```
src/components/
├── chat/              # Chat-related components
├── modals/            # Modal dialogs
├── navigation/        # Navigation components
├── providers/         # Component providers
├── ui/               # Shared UI components
├── workspace/        # Workspace components
└── [Individual Components]
```

## Component Categories

### Feature Components
1. **Chat Components**
   - Message handling
   - Chat interfaces
   - Real-time updates

2. **Workspace Components**
   - Workspace management
   - Channel interfaces
   - Member management

3. **Navigation Components**
   - App navigation
   - Routing controls
   - Navigation bars

### UI Components
1. **Modal Components**
   - Dialog boxes
   - Popups
   - Overlays

2. **Shared UI**
   - Buttons
   - Forms
   - Common elements

### Standalone Components
- `status-dialog.tsx`: User status management
- `workspace-list-client.tsx`: Workspace listing
- `message-reactions.tsx`: Message reactions
- `user-avatar.tsx`: User avatars
- `markdown.tsx`: Markdown rendering
- `reaction-picker.tsx`: Emoji reactions
- `action-tooltip.tsx`: Tooltips

## Architecture Patterns
1. Client/Server Component Split
2. Composition-based design
3. Reusable UI components
4. Feature-based organization 