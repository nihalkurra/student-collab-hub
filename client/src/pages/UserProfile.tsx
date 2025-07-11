import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

interface UserPost {
  _id: string;
  title: string;
  content: string;
  type: 'note' | 'job';
  category: string;
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  university: string;
  major: string;
  bio: string;
  followers: string[];
  following: string[];
  isFollowing?: boolean;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFollowing(data.user.isFollowing || false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/users/${user._id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFollowing(!following);
        setUser(prev => prev ? {
          ...prev,
          followers: following 
            ? prev.followers.filter(id => id !== currentUser._id)
            : [...prev.followers, currentUser._id]
        } : null);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      academic: 'bg-blue-100 text-blue-800',
      project: 'bg-green-100 text-green-800',
      research: 'bg-purple-100 text-purple-800',
      internship: 'bg-yellow-100 text-yellow-800',
      'part-time': 'bg-orange-100 text-orange-800',
      'full-time': 'bg-red-100 text-red-800',
      freelance: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
        <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-4">Go Home</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === user._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-primary-600" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.fullName}</h1>
              <p className="text-gray-600 mb-1">@{user.username}</p>
              {user.university && user.major && (
                <p className="text-gray-600">{user.university} • {user.major}</p>
              )}
              {user.bio && (
                <p className="text-gray-700 mt-3 max-w-md">{user.bio}</p>
              )}
            </div>
          </div>
          
          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                following
                  ? 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                  : 'border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              {following ? (
                <>
                  <UserMinusIcon className="w-4 h-4" />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.followers.length}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.following.length}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'posts' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Posts ({userPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'about' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "You haven't shared any posts yet. Start sharing your knowledge and experiences!"
                  : `${user.fullName} hasn't shared any posts yet.`
                }
              </p>
              {isOwnProfile && (
                <Link to="/create-post" className="btn-primary mt-4">
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post._id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link to={`/post/${post._id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 line-clamp-3">{post.content}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      {post.type === 'note' ? (
                        <AcademicCapIcon className="w-4 h-4" />
                      ) : (
                        <BriefcaseIcon className="w-4 h-4" />
                      )}
                      <span className="text-xs capitalize">{post.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">About {user.fullName}</h2>
          
          <div className="space-y-6">
            {user.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Education</h3>
              <div className="space-y-2">
                {user.university && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">University:</span>
                    <span className="text-gray-900">{user.university}</span>
                  </div>
                )}
                {user.major && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Major:</span>
                    <span className="text-gray-900">{user.major}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Member Since</h3>
              <p className="text-gray-700">
                {new Date().getFullYear()} • {userPosts.length} posts shared
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 