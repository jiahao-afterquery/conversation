import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, User, LogOut } from 'lucide-react';

const UserList = ({ users, currentUser, onStartConversation, conversation, onLeavePlatform }) => {
  const navigate = useNavigate();

  // Navigate to conversation if one is active
  useEffect(() => {
    if (conversation) {
      navigate('/conversation');
    }
  }, [conversation, navigate]);

  const availableUsers = users.filter(user => 
    user.id !== currentUser.id && !user.isInConversation
  );

  const handleStartConversation = (targetUserId) => {
    onStartConversation(targetUserId);
  };

  const handleLogout = () => {
    if (onLeavePlatform) {
      onLeavePlatform();
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {currentUser.name}!
                </h1>
                <p className="text-sm text-gray-500">
                  {users.length} users online
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Available Users
              </h2>
            </div>
            <p className="text-gray-600 mt-1">
              Select a user to start a conversation
            </p>
          </div>

          <div className="p-6">
            {availableUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No available users
                </h3>
                <p className="text-gray-500">
                  All users are currently in conversations or offline.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-green-600 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Available
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartConversation(user.id)}
                      className="btn-primary flex items-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Conversation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Online Users Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Users ({users.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  user.id === currentUser.id
                    ? 'bg-primary-50 border-primary-200'
                    : user.isInConversation
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.id === currentUser.id
                      ? 'bg-primary-500'
                      : user.isInConversation
                      ? 'bg-gray-400'
                      : 'bg-green-500'
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                  {user.id === currentUser.id && ' (You)'}
                </span>
                {user.isInConversation && (
                  <span className="text-xs text-gray-500">In conversation</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
