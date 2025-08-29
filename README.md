# Audio Collection Platform

A real-time audio collection platform that enables up to 1000 users to join and participate in one-on-one conversations with audio recording capabilities.

## Features

- **Real-time Audio Communication**: Powered by Agora SDK for high-quality, low-latency audio
- **User Management**: Support for up to 1000 concurrent users
- **One-on-One Conversations**: Only two users can be in a conversation at the same time
- **Audio Recording**: Record conversations and automatically upload audio files to the server
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Real-time Updates**: Live status updates using Socket.io
- **File Management**: View and manage recorded audio files

## Tech Stack

### Backend
- **Node.js** with Express
- **Socket.io** for real-time communication
- **Agora SDK** for audio/video communication
- **Multer** for file uploads
- **CORS** for cross-origin requests

### Frontend
- **React** with hooks
- **Socket.io Client** for real-time updates
- **Agora RTC SDK** for audio communication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for HTTP requests

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Agora account and credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd audio-collection-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 3. Configure Agora

1. Sign up for an Agora account at [https://www.agora.io/](https://www.agora.io/)
2. Create a new project in the Agora Console
3. Get your App ID and App Certificate
4. Copy the environment variables:

```bash
cd server
cp env.example .env
```

5. Edit the `.env` file and add your Agora credentials:

```env
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
PORT=5000
NODE_ENV=development
```

### 4. Start the Application

#### Development Mode (Recommended)
```bash
# Start both server and client concurrently
npm run dev
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm run server
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### 1. Joining the Platform
- Open the application in your browser
- Enter your name and click "Join Platform"
- You'll be redirected to the user list

### 2. Starting a Conversation
- View the list of available users
- Click "Start Conversation" next to any available user
- Both users will be automatically connected to the audio channel

### 3. Audio Controls
- **Mute/Unmute**: Toggle your microphone on/off
- **Start Recording**: Begin recording the conversation
- **Stop Recording**: Stop recording and upload the audio file
- **End Conversation**: Disconnect and return to the user list

### 4. Managing Recordings
- View all recorded files in the conversation interface
- Files are automatically uploaded when recording stops
- Each user's audio is recorded separately

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Audio Upload
- `POST /api/upload-audio` - Upload audio file
  - Body: FormData with `audio`, `conversationId`, `userId`

### File Management
- `GET /api/conversation/:conversationId/files` - Get conversation files

## Socket Events

### Client to Server
- `join-platform` - User joins the platform
- `start-conversation` - Start conversation with another user
- `start-recording` - Start recording conversation
- `stop-recording` - Stop recording conversation
- `end-conversation` - End current conversation

### Server to Client
- `user-list-updated` - Updated list of online users
- `conversation-started` - Conversation has been initiated
- `conversation-ended` - Conversation has ended
- `recording-started` - Recording has started
- `recording-stopped` - Recording has stopped
- `error` - Error message

## Project Structure

```
audio-collection-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── uploads/           # Audio file storage
│   ├── index.js           # Main server file
│   ├── package.json
│   └── env.example
├── package.json           # Root package.json
└── README.md
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AGORA_APP_ID` | Your Agora App ID | Yes |
| `AGORA_APP_CERTIFICATE` | Your Agora App Certificate | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Agora Configuration

The application uses Agora's RTC (Real-Time Communication) mode with the following settings:
- **Mode**: RTC
- **Codec**: VP8
- **Token Expiration**: 1 hour
- **Role**: Publisher (both users can publish audio)

## Security Considerations

- Agora tokens are generated server-side and expire after 1 hour
- Audio files are stored locally (consider cloud storage for production)
- CORS is configured for development (adjust for production)
- Input validation is implemented for file uploads

## Production Deployment

### Backend Deployment
1. Set up a production server (AWS, Heroku, etc.)
2. Configure environment variables
3. Set up a database for user management (optional)
4. Configure cloud storage for audio files
5. Set up SSL certificates

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to a static hosting service (Netlify, Vercel, etc.)
3. Update the API endpoint in the client code
4. Configure CORS on the backend

### Scaling Considerations
- Use Redis for session management
- Implement database for user persistence
- Set up load balancing for multiple server instances
- Configure CDN for static assets

## Troubleshooting

### Common Issues

1. **Agora Connection Failed**
   - Verify App ID and Certificate are correct
   - Check network connectivity
   - Ensure microphone permissions are granted

2. **Audio Not Working**
   - Check browser microphone permissions
   - Verify Agora credentials
   - Check browser console for errors

3. **File Upload Failed**
   - Check server storage permissions
   - Verify file size limits
   - Check network connectivity

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review Agora documentation
- Open an issue on GitHub
