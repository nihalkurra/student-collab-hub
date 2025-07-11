import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  createdAt: string;
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
    university: string;
    major: string;
  };
  likes: string[];
  comments: Comment[];
  views: number;
  createdAt: string;
  tags?: string[];
  attachments?: string[];
  isLiked?: boolean;
}

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        setEditContent(data.post.content);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPost(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likes: prev.isLiked 
            ? prev.likes.filter(id => id !== user._id)
            : [...prev.likes, user._id]
        } : null);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost(prev => prev ? {
          ...prev,
          comments: [newComment.comment, ...prev.comments]
        } : null);
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !post) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setPost(prev => prev ? {
          ...prev,
          comments: prev.comments.filter(c => c._id !== commentId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUpdatePost = async () => {
    if (!user || !post) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setPost(prev => prev ? { ...prev, content: editContent } : null);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post) return;

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        window.history.back();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary mt-4">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link to={`/user/${post.author._id}`}>
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.fullName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary-600" />
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <div className="flex items-center space-x-1 text-gray-400">
              {post.type === 'note' ? (
                <AcademicCapIcon className="w-5 h-5" />
              ) : (
                <BriefcaseIcon className="w-5 h-5" />
              )}
              <span className="text-sm capitalize">{post.type}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          {editing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdatePost}
                  className="btn-primary"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(post.content);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
            <div className="space-y-2">
              {post.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-medium">PDF</span>
                  </div>
                  <span className="text-sm text-gray-700">Attachment {index + 1}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                post.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {post.isLiked ? (
                <HeartIconSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{post.likes.length}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>{post.comments.length}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <EyeIcon className="w-5 h-5" />
              <span>{post.views}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            
            {user && user._id === post.author._id && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments ({post.comments.length})</h2>
        
        {/* Add Comment */}
        {user && (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {post.comments.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  {comment.author.avatar ? (
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {comment.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        to={`/user/${comment.author._id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {comment.author.fullName}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {user && user._id === comment.author._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 