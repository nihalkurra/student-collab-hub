import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserPlusIcon,
  UserMinusIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface User {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  university: string;
  major: string;
  bio: string;
  followers: string[];
  isFollowing?: boolean;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  type: 'note' | 'job';
  category: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
}

const Explore: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPosts();
    }
  }, [activeTab, searchQuery, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`http://localhost:5001/api/users/explore?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filter !== 'all') {
        params.append('type', filter);
      }
      
      const response = await fetch(`http://localhost:5001/api/posts/explore?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u._id === userId 
            ? { 
                ...u, 
                isFollowing: !u.isFollowing,
                followers: u.isFollowing 
                  ? u.followers.filter(id => id !== user._id)
                  : [...u.followers, user._id]
              }
            : u
        ));
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-gray-600">Discover new people and content in the community</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'users' ? 'Search users...' : 'Search posts...'}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'posts' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Posts ({posts.length})
        </button>
      </div>

      {/* Filter for Posts */}
      {activeTab === 'posts' && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('note')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              filter === 'note' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setFilter('job')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              filter === 'job' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BriefcaseIcon className="w-4 h-4" />
            <span>Jobs</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && !loading && (
        <div className="space-y-6">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No users match "${searchQuery}"`
                  : 'No users available at the moment'
                }
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link to={`/user/${user._id}`}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.fullName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-primary-600" />
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1">
                      <Link 
                        to={`/user/${user._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {user.fullName}
                      </Link>
                      <p className="text-gray-600">@{user.username}</p>
                      {user.university && user.major && (
                        <p className="text-sm text-gray-500">{user.university} • {user.major}</p>
                      )}
                      {user.bio && (
                        <p className="text-gray-700 mt-1 line-clamp-2">{user.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  {user._id !== user?._id && (
                    <button
                      onClick={() => handleFollow(user._id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        user.isFollowing
                          ? 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                          : 'border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      {user.isFollowing ? (
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
                
                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{user.followers.length}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && !loading && (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No posts match "${searchQuery}"`
                  : 'No posts available at the moment'
                }
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Link to={`/user/${post.author._id}`}>
                      {post.author.avatar ? (
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {post.author.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link 
                        to={`/user/${post.author._id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {post.author.fullName}
                      </Link>
                      <div className="text-sm text-gray-500">@{post.author.username}</div>
                    </div>
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

                <Link to={`/post/${post._id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.length > 200 
                      ? `${post.content.substring(0, 200)}...` 
                      : post.content
                    }
                  </p>
                </Link>

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
    </div>
  );
};

export default Explore; 