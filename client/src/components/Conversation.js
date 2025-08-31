import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Square, 
  Circle, 
  ArrowLeft,
  LogOut
} from 'lucide-react';
import axios from 'axios';

const Conversation = ({ 
  conversation, 
  currentUser, 
  socket,
  onEndConversation, 
  onStartRecording, 
  onStopRecording,
  onLeavePlatform 
}) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(conversation?.isRecording || false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [showRecordingNotification, setShowRecordingNotification] = useState(false);
  const [recordingMode, setRecordingMode] = useState('separate'); // 'separate' or 'mixed'
  const [isDemoMode, setIsDemoMode] = useState(false);

  const agoraEngine = useRef(null);
  const localAudioTrack = useRef(null);
  const remoteAudioTrack = useRef(null);
  const localMediaRecorder = useRef(null);
  const remoteMediaRecorder = useRef(null);
  const localRecordedChunks = useRef([]);
  const remoteRecordedChunks = useRef([]);

  // Check if we're on HTTPS (required for mediaDevices on mobile)
  const checkHTTPS = () => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('⚠️ MediaDevices requires HTTPS on mobile devices!');
      console.warn('Current protocol:', window.location.protocol);
      console.warn('Current hostname:', window.location.hostname);
      return false;
    }
    return true;
  };

  useEffect(() => {
    initializeAgora();

    return () => {
      cleanupAgora();
    };
  }, []);

  // Sync recording state with conversation object
  useEffect(() => {
    if (conversation) {
      const wasRecording = isRecording;
      const isNowRecording = conversation.isRecording || false;
      setIsRecording(isNowRecording);
      
      console.log('Recording state changed:', {
        wasRecording,
        isNowRecording,
        conversationId: conversation.conversationId,
        userId: currentUser.id
      });
      
      // Show notification when recording starts (if it wasn't recording before)
      if (!wasRecording && isNowRecording) {
        setShowRecordingNotification(true);
        // Hide notification after 5 seconds
        setTimeout(() => setShowRecordingNotification(false), 5000);
        
        // Automatically start recording for this user when recording starts
        console.log('Starting recording for this user due to conversation state change');
        startRecordingForThisUser();
      }
      
      // Stop recording when conversation recording stops
      if (wasRecording && !isNowRecording) {
        console.log('Stopping recording for this user due to conversation state change');
        stopRecordingForThisUser();
      }
    }
  }, [conversation?.isRecording, isRecording]);

  const initializeAgora = async () => {
    try {
      console.log('Initializing Agora with token:', conversation.token ? 'Valid token' : 'No token');
      console.log('Channel name:', conversation.channelName);
      console.log('User ID:', currentUser.id);

      // Check if we have valid Agora credentials
      if (!conversation.token || conversation.token === 'demo-token') {
        console.warn('Using demo mode - Agora credentials not configured');
        setIsConnected(true); // Simulate connection for demo
        setIsDemoMode(true);
        return;
      }

      // Create Agora client
      agoraEngine.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Set up event handlers
      agoraEngine.current.on('user-published', handleUserPublished);
      agoraEngine.current.on('user-unpublished', handleUserUnpublished);
      agoraEngine.current.on('connection-state-change', (curState, prevState) => {
        console.log('Agora connection state changed:', prevState, '->', curState);
      });

      console.log('Attempting to join Agora channel...');
      
      // Sanitize channel name and user ID for Agora requirements
      const sanitizeForAgora = (str) => {
        if (!str) return 'default';
        // Remove invalid characters and limit length to 64 bytes
        return str.replace(/[^a-zA-Z0-9\s!#$%&()+\-:;<=.>?@[\]^_{|}~,]/g, '').substring(0, 64);
      };
      
      const channelName = sanitizeForAgora(conversation.channelName);
      const userId = sanitizeForAgora(currentUser.id || socket?.id || 'user');
      
      console.log('Sanitized parameters:', {
        originalChannelName: conversation.channelName,
        sanitizedChannelName: channelName,
        originalUserId: currentUser.id,
        sanitizedUserId: userId
      });
      
      // Join the channel
      // Agora join method: join(appId, channelName, token, uid)
      const appId = conversation.appId || '888d6b7ad52f4764b257a1252331d2b2';
      
      console.log('Joining Agora channel with parameters:', {
        appId: appId,
        channelName: channelName,
        token: conversation.token ? 'Valid token' : 'No token',
        userId: userId
      });
      
      await agoraEngine.current.join(
        appId, // App ID
        channelName, // Channel name
        conversation.token, // Token
        userId // User ID
      );

      console.log('Successfully joined Agora channel, creating microphone track...');

      // Create and publish local audio track
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      await agoraEngine.current.publish([localAudioTrack.current]);

      setIsConnected(true);
      console.log('Successfully joined Agora channel and published audio track');
    } catch (error) {
      console.error('Error initializing Agora:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      // Don't show alert for demo mode
      if (conversation.token !== 'demo-token') {
        console.warn('Agora connection failed, but continuing with demo mode');
        setIsDemoMode(true);
      }
      setIsConnected(true); // Simulate connection for demo
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    await agoraEngine.current.subscribe(user, mediaType);
    
    if (mediaType === 'audio') {
      setRemoteUser(user);
      remoteAudioTrack.current = user.audioTrack;
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user) => {
    setRemoteUser(null);
  };

  const cleanupAgora = async () => {
    if (localAudioTrack.current) {
      localAudioTrack.current.close();
    }
    if (agoraEngine.current) {
      await agoraEngine.current.leave();
    }
  };

  const toggleMute = () => {
    if (localAudioTrack.current) {
      if (isMuted) {
        localAudioTrack.current.setEnabled(true);
      } else {
        localAudioTrack.current.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  // Function to start recording for this specific user (called automatically when recording starts)
  const startRecordingForThisUser = async () => {
    try {
      console.log('=== START RECORDING FOR THIS USER ===');
      console.log('Current user:', currentUser);
      console.log('Conversation:', conversation);
      console.log('Socket ID:', socket?.id);

      // Check HTTPS for mobile devices
      if (!checkHTTPS()) {
        console.warn('HTTPS check failed - recording may not work on mobile');
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices not available. This might be due to:');
        console.error('1. Page not served over HTTPS');
        console.error('2. Browser doesn\'t support getUserMedia');
        console.error('3. User hasn\'t granted microphone permissions');
        throw new Error('MediaDevices not available');
      }

      // Start local audio recording (this always works)
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localMediaRecorder.current = new MediaRecorder(localStream, {
        mimeType: 'audio/wav'
      });
      localRecordedChunks.current = [];

      localMediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localRecordedChunks.current.push(event.data);
        }
      };

      localMediaRecorder.current.start();
      console.log('Local recording started for this user');

      // Try to capture remote audio separately
      let remoteStream = null;
      if (remoteAudioTrack.current) {
        try {
          // Method 1: Try to get the MediaStreamTrack directly
          try {
            const mediaStreamTrack = remoteAudioTrack.current.getMediaStreamTrack();
            if (mediaStreamTrack && mediaStreamTrack.readyState === 'live') {
              remoteStream = new MediaStream([mediaStreamTrack]);
              console.log('Remote audio track captured via getMediaStreamTrack');
            }
          } catch (error) {
            console.log('getMediaStreamTrack failed, trying alternative method');
          }

          // Method 2: Use Agora's audio processing to capture remote audio
          if (!remoteStream && agoraEngine.current) {
            try {
              // Create an audio context to process the remote audio
              const audioContext = new AudioContext();
              
              // Get the remote audio track's audio buffer
              const remoteAudioBuffer = await remoteAudioTrack.current.getAudioBuffer();
              if (remoteAudioBuffer) {
                // Create a MediaStream from the audio buffer
                const source = audioContext.createBufferSource();
                source.buffer = remoteAudioBuffer;
                const destination = audioContext.createMediaStreamDestination();
                source.connect(destination);
                remoteStream = destination.stream;
                console.log('Remote audio captured via audio buffer');
              }
            } catch (error) {
              console.log('Audio buffer method failed, trying volume indicator');
            }
          }

          // Method 3: Use Agora's volume indicator to capture remote audio
          if (!remoteStream && agoraEngine.current) {
            try {
              // Set up volume indicator for remote user
              agoraEngine.current.enableAudioVolumeIndicator();
              
              // Create a custom audio context to capture remote audio
              const audioContext = new AudioContext();
              const destination = audioContext.createMediaStreamDestination();
              
              // Create a script processor to capture remote audio
              const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (event) => {
                const inputBuffer = event.inputBuffer;
                const outputBuffer = event.outputBuffer;
                
                // Copy remote audio data
                for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                  const inputData = inputBuffer.getChannelData(channel);
                  const outputData = outputBuffer.getChannelData(channel);
                  outputData.set(inputData);
                }
              };
              
              // Connect remote audio track to the processor
              const remoteSource = audioContext.createMediaStreamSource(remoteAudioTrack.current.getMediaStreamTrack());
              remoteSource.connect(scriptProcessor);
              scriptProcessor.connect(destination);
              
              remoteStream = destination.stream;
              console.log('Remote audio captured via volume indicator');
            } catch (error) {
              console.log('Volume indicator method failed');
            }
          }

          // Start remote recording if we captured remote audio
          if (remoteStream) {
            remoteMediaRecorder.current = new MediaRecorder(remoteStream, {
              mimeType: 'audio/wav'
            });
            remoteRecordedChunks.current = [];

            remoteMediaRecorder.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                remoteRecordedChunks.current.push(event.data);
              }
            };

            remoteMediaRecorder.current.start();
            console.log('Remote recording started for this user');
            setRecordingMode('separate');
          } else {
            console.log('Could not capture remote audio, will use mixed recording only');
            setRecordingMode('mixed');
          }
        } catch (error) {
          console.warn('Remote audio capture failed:', error);
          setRecordingMode('mixed');
        }
      } else {
        console.log('No remote user connected, recording local audio only');
        setRecordingMode('local-only');
      }

      // Always start mixed recording to capture both users combined
      await startMixedRecording(localStream);
    } catch (error) {
      console.error('Error starting recording for this user:', error);
      
      // If mediaDevices fails, we can still coordinate recording
      // The other user can still record even if this user can't
      if (error.message === 'MediaDevices not available') {
        console.warn('MediaDevices not available, but recording coordination will continue');
        console.log('Recording coordination is working - UI will show recording state');
        // Set recording state to true so UI shows recording is active
        setIsRecording(true);
        // Don't throw error - let the recording coordination continue
        return;
      }
      
      // Don't show alert for automatic recording start
    }
  };

  // Function to stop recording for this specific user (called automatically when recording stops)
  const stopRecordingForThisUser = async () => {
    try {
      console.log('=== STOP RECORDING FOR THIS USER ===');
      console.log('Current user:', currentUser);
      console.log('Conversation:', conversation);
      console.log('Socket ID:', socket?.id);
      
      // Stop local recording and upload
      if (localMediaRecorder.current && localMediaRecorder.current.state !== 'inactive') {
        localMediaRecorder.current.stop();
        localMediaRecorder.current.onstop = async () => {
          console.log('🛑 Local recording stopped, creating blob...');
          console.log('📊 Local chunks length:', localRecordedChunks.current.length);
          
          const localBlob = new Blob(localRecordedChunks.current, { type: 'audio/wav' });
          console.log('📦 Local blob created:', {
            size: localBlob.size,
            type: localBlob.type
          });
          
          console.log('📤 Calling uploadAudioFile for local recording...');
          await uploadAudioFile(localBlob, 'local');
          localRecordedChunks.current = [];
          console.log('🧹 Local chunks cleared');
        };
      }

      // Stop remote recording and upload (if available)
      if (remoteMediaRecorder.current && remoteMediaRecorder.current.state !== 'inactive') {
        remoteMediaRecorder.current.stop();
        remoteMediaRecorder.current.onstop = async () => {
          console.log('🛑 Remote recording stopped, creating blob...');
          console.log('📊 Remote chunks length:', remoteRecordedChunks.current.length);
          
          const remoteBlob = new Blob(remoteRecordedChunks.current, { type: 'audio/wav' });
          console.log('📦 Remote blob created:', {
            size: remoteBlob.size,
            type: remoteBlob.type
          });
          
          console.log('📤 Calling uploadAudioFile for remote recording...');
          await uploadAudioFile(remoteBlob, 'remote');
          remoteRecordedChunks.current = [];
          console.log('🧹 Remote chunks cleared');
        };
      }

      // Stop mixed recording (captures both users)
      if (window.mixedRecorder && window.mixedRecorder.state !== 'inactive') {
        window.mixedRecorder.stop();
      }

      console.log('Recording stopped for this user - all files uploaded automatically');
    } catch (error) {
      console.error('Error stopping recording for this user:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      // Start recording on the server (this will trigger recording for both users)
      onStartRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording');
    }
  };

  // Helper function for mixed recording (captures both users)
  const startMixedRecording = async (localStream) => {
    try {
      const audioContext = new AudioContext();
      const localSource = audioContext.createMediaStreamSource(localStream);
      const destination = audioContext.createMediaStreamDestination();
      
      localSource.connect(destination);
      
      // Try to add remote audio to the mix
      if (remoteAudioTrack.current) {
        try {
          const remoteStream = new MediaStream([remoteAudioTrack.current.getMediaStreamTrack()]);
          const remoteSource = audioContext.createMediaStreamSource(remoteStream);
          remoteSource.connect(destination);
          console.log('Remote audio added to mixed recording');
        } catch (remoteError) {
          console.warn('Could not add remote audio to mix:', remoteError);
        }
      }
      
      // Create mixed recorder (separate from remote recorder)
      const mixedRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/wav'
      });
      const mixedChunks = [];

      mixedRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mixedChunks.push(event.data);
        }
      };

      mixedRecorder.onstop = async () => {
        console.log('🛑 Mixed recording stopped, creating blob...');
        console.log('📊 Mixed chunks length:', mixedChunks.length);
        
        if (mixedChunks.length > 0) {
          const mixedBlob = new Blob(mixedChunks, { type: 'audio/wav' });
          console.log('📦 Mixed blob created:', {
            size: mixedBlob.size,
            type: mixedBlob.type
          });
          
          console.log('📤 Calling uploadAudioFile for mixed recording...');
          await uploadAudioFile(mixedBlob, 'mixed');
        } else {
          console.log('⚠️ No mixed chunks to upload');
        }
      };

      mixedRecorder.start();
      console.log('Mixed recording started (includes both users)');
      
      // Store the mixed recorder reference
      window.mixedRecorder = mixedRecorder;
    } catch (error) {
      console.warn('Could not start mixed recording:', error);
      setRecordingMode('local-only');
    }
  };

  const handleStopRecording = async () => {
    try {
      // Stop recording on the server (this will trigger recording stop for both users)
      onStopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to stop recording');
    }
  };

  const uploadAudioFile = async (audioBlob, audioType = 'local') => {
    try {
      console.log('🚀 Starting uploadAudioFile...');
      console.log('📊 Upload details:', {
        audioType,
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        conversationId: conversation.conversationId,
        currentUser: currentUser,
        socketId: socket.id
      });
      
      // Use socket ID as fallback if user ID is undefined
      const userId = currentUser.id || socket.id;
      
      console.log('👤 Using userId:', userId);
      
      console.log('Uploading audio file:', {
        audioType,
        conversationId: conversation.conversationId,
        userId: userId,
        currentUser: currentUser,
        socketId: socket.id
      });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `${audioType}_recording.wav`);
      formData.append('conversationId', conversation.conversationId);
      formData.append('userId', userId);
      formData.append('audioType', audioType);

      console.log('📦 FormData created with:', {
        audioFile: `${audioType}_recording.wav`,
        conversationId: conversation.conversationId,
        userId: userId,
        audioType: audioType
      });

      const API_BASE_URL = process.env.REACT_APP_SERVER_URL || '';
      console.log('🌐 API URL:', `${API_BASE_URL}/api/upload-audio`);
      
      console.log('📤 Sending upload request...');
      const response = await axios.post(`${API_BASE_URL}/api/upload-audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Upload response received:', response.data);

      if (response.data.success) {
        console.log(`✅ ${audioType} audio file uploaded successfully`);
        console.log('📄 File info:', response.data.fileInfo);
      } else {
        console.error(`❌ Upload failed:`, response.data);
      }
    } catch (error) {
      console.error(`❌ Error uploading ${audioType} audio file:`, error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      // Don't show alert for remote audio upload failures as they're expected
      if (audioType === 'local') {
        alert('Failed to upload audio file');
      }
    }
  };





  const handleEndConversation = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    await cleanupAgora();
    onEndConversation();
    navigate('/users');
  };

  const otherParticipant = conversation.participants.find(
    p => p.id !== currentUser.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEndConversation}
                className="btn-secondary flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Conversation with {otherParticipant?.name}
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
                {isDemoMode && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onLeavePlatform && (
                <button
                  onClick={onLeavePlatform}
                  className="btn-secondary flex items-center text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Platform
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Notification Banner */}
      {showRecordingNotification && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Circle className="w-5 h-5 text-red-400 mr-3 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Recording Started
                </p>
                <p className="text-sm text-red-700">
                  The conversation is now being recorded. You can stop recording at any time.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRecordingNotification(false)}
              className="text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Controls */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Audio Controls
            </h2>
            
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Connection Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? (
                      <span className="flex items-center">
                        <span>Connected</span>
                        {isDemoMode && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Demo Mode
                          </span>
                        )}
                      </span>
                    ) : (
                      'Disconnected'
                    )}
                  </span>
                </div>
              </div>

              {/* Remote User Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Remote User</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${remoteUser ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {remoteUser ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Recording Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Recording Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full recording-indicator ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isRecording ? (
                      <span className="flex items-center">
                        <span className="text-red-600 font-medium">Recording Active</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({recordingMode === 'separate' ? 'Separate audio' : 
                            recordingMode === 'mixed' ? 'Mixed audio' : 
                            'Local audio only'})
                        </span>
                      </span>
                    ) : (
                      'Not Recording'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={toggleMute}
                  className={`flex items-center justify-center p-4 rounded-lg border transition-colors duration-200 ${
                    isMuted 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>

                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={!isConnected}
                  className={`flex items-center justify-center p-4 rounded-lg border transition-colors duration-200 ${
                    isRecording
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? <Square className="w-5 h-5 mr-2" /> : <Circle className="w-5 h-5 mr-2" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                  {isRecording && (
                    <span className="text-xs ml-1 opacity-75">(Anyone)</span>
                  )}
                </button>
              </div>



              <button
                onClick={handleEndConversation}
                className="w-full btn-danger flex items-center justify-center"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Conversation
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );

  // Add test functions to window for debugging
  React.useEffect(() => {
    window.testUpload = () => {
      console.log('🧪 Testing upload function...');
      const testBlob = new Blob(['test audio data'], { type: 'audio/wav' });
      uploadAudioFile(testBlob, 'test');
    };

    window.testRecording = async () => {
      console.log('🧪 Testing recording function...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
        const chunks = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          console.log('🧪 Test recording blob created:', { size: blob.size, type: blob.type });
          await uploadAudioFile(blob, 'test-recording');
        };
        
        recorder.start();
        console.log('🧪 Test recording started...');
        
        setTimeout(() => {
          recorder.stop();
          stream.getTracks().forEach(track => track.stop());
          console.log('🧪 Test recording stopped...');
        }, 3000);
        
      } catch (error) {
        console.error('🧪 Test recording failed:', error);
      }
    };

    return () => {
      delete window.testUpload;
      delete window.testRecording;
    };
  }, []);
};
