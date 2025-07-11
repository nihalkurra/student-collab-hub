import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

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
  tags?: string[];
}

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
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
    <div className="card-hover">
      {/* Header */}
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
            <div className="text-sm text-gray-500">
              {post.author.university && post.author.major && (
                <span>{post.author.university} • {post.author.major}</span>
              )}
            </div>
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

      {/* Content */}
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

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isLiked ? (
              <HeartIconSolid className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{likeCount}</span>
          </button>
          
          <Link 
            to={`/post/${post._id}`}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{post.comments.length}</span>
          </Link>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <EyeIcon className="w-4 h-4" />
            <span>{post.views}</span>
          </div>
        </div>
        
        <span className="text-sm text-gray-400">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default PostCard; 