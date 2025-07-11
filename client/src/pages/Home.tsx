import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

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
    university: string;
    major: string;
  };
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  isLiked?: boolean;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      
      const response = await fetch(`http://localhost:5001/api/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      {!user && (
        <div className="text-center py-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Student Collab Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with fellow students, share academic resources, and discover opportunities. 
            Join our community to collaborate and grow together.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/explore" className="btn-outline text-lg px-8 py-3">
              Explore Posts
            </Link>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Posts
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

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Be the first to share a note or job opportunity!'
              : filter === 'note' 
                ? 'No notes shared yet. Share your first academic note!'
                : 'No job opportunities posted yet. Share the first opportunity!'
            }
          </p>
          {user && (
            <Link to="/create-post" className="btn-primary">
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 