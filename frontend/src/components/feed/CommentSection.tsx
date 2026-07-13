import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Comment } from '@/types';
import LikesModal from '@/components/feed/LikesModal';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentCreated: (comment: Comment, parentId: string | null) => void;
}

export default function CommentSection({ postId, comments, onCommentCreated }: CommentSectionProps) {
  const [localComments, setLocalComments] = useState(comments);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeLikes, setActiveLikes] = useState<{ id: string; name: string; }[] | null>(null);
  const [likesTitle, setLikesTitle] = useState('Liked by');

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const updateLikeState = (
    items: Comment[],
    targetId: string,
    likeState: { liked: boolean; likes_count: number; liked_by_users: { id: string; name: string }[] }
  ): Comment[] => {
    return items.map((item) => {
      if (item.id === targetId) {
        return { ...item, ...likeState };
      }

      return {
        ...item,
        replies: item.replies.map((reply) =>
          reply.id === targetId ? { ...reply, ...likeState } : reply
        ),
      };
    });
  };

  // Submit top-level comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const createdComment = await apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText }),
      });
      setLocalComments((prev) => [createdComment, ...prev]);
      onCommentCreated(createdComment, null);
      setCommentText('');
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    }
  };

  // Submit reply (one-level reply nesting)
  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const createdReply = await apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: replyText, parent_id: commentId }),
      });
      setLocalComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, createdReply] }
            : comment
        )
      );
      onCommentCreated(createdReply, commentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add reply');
    }
  };

  // Like / Unlike comment or reply
  const handleLike = async (commentId: string) => {
    try {
      const data = await apiRequest(`/api/comments/${commentId}/like`, { method: 'POST' });
      setLocalComments((prev) => updateLikeState(prev, commentId, data));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="_feed_inner_timeline_cooment_area border-top pt-3 mt-2">
      {/* New Comment Input */}
      <div className="_feed_inner_comment_box mb-3">
        <form onSubmit={handleCommentSubmit} className="_feed_inner_comment_box_form">
          <div className="_feed_inner_comment_box_content d-flex gap-2 align-items-center">
            <div className="_feed_inner_comment_box_content_image bg-emerald-500 text-white flex items-center justify-center font-bold text-xs" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}>
              C
            </div>
            <div className="_feed_inner_comment_box_content_txt flex-grow-1">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="form-control"
                style={{ fontSize: '13px', borderRadius: '8px', padding: '6px 12px' }}
              />
            </div>
            <button type="submit" className="btn btn-emerald text-white btn-sm" style={{ backgroundColor: '#10b981', border: '0', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold' }}>
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="_timline_comment_main space-y-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {localComments.map((comment) => {
          const commentInitials = `${comment.author.first_name[0].toUpperCase()}${comment.author.last_name[0].toUpperCase()}`;
          return (
            <div key={comment.id} className="mb-3">
              {/* Comment row */}
              <div className="_comment_main d-flex gap-2">
                <div className="_comment_image bg-emerald-500 text-white flex items-center justify-center font-bold text-xs" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}>
                  {commentInitials}
                </div>
                <div className="_comment_area flex-grow-1">
                  <div className="_comment_details bg-light p-2.5 rounded-3" style={{ borderRadius: '12px' }}>
                    <div className="_comment_details_top d-flex justify-content-between align-items-center">
                      <div className="_comment_name">
                        <h4 className="_comment_name_title" style={{ fontSize: '12.5px', fontWeight: 'bold', margin: 0 }}>
                          {comment.author.first_name} {comment.author.last_name}
                        </h4>
                      </div>
                    </div>
                    <div className="_comment_status mt-1">
                      <p className="_comment_status_text" style={{ fontSize: '13px', margin: 0, color: '#333' }}>
                        {comment.content}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top" style={{ fontSize: '11px' }}>
                      <div className="d-flex align-items-center gap-3">
                        <button 
                          onClick={() => handleLike(comment.id)} 
                          className="bg-transparent border-0 p-0 font-bold hover:text-emerald-600"
                          style={{ color: comment.liked ? '#10b981' : '#666', cursor: 'pointer' }}
                        >
                          Like
                        </button>
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} 
                          className="bg-transparent border-0 p-0 text-secondary font-bold hover:text-emerald-600"
                          style={{ cursor: 'pointer' }}
                        >
                          Reply
                        </button>
                        <span className="text-muted">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {comment.likes_count > 0 && (
                        <button 
                          onClick={() => {
                            setActiveLikes(comment.liked_by_users || []);
                            setLikesTitle('Comment Liked by');
                          }}
                          className="bg-transparent border-0 p-0 text-emerald-600 font-bold hover:underline"
                          style={{ cursor: 'pointer' }}
                        >
                          {comment.likes_count} likes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply Input Box */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="d-flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ fontSize: '12px', borderRadius: '6px' }}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-xs btn-emerald text-white" style={{ backgroundColor: '#10b981', border: 0, fontSize: '11px', borderRadius: '6px', padding: '2px 8px' }}>
                        Send
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Replies list */}
            {comment.replies && comment.replies.map((reply) => {
                const replyInitials = `${reply.author.first_name[0].toUpperCase()}${reply.author.last_name[0].toUpperCase()}`;
                return (
                  <div key={reply.id} className="d-flex gap-2 pl-4 mt-2 ms-4 border-left">
                    <div className="_comment_image bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]" style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0 }}>
                      {replyInitials}
                    </div>
                    <div className="_comment_area flex-grow-1">
                      <div className="_comment_details bg-light/75 p-2 rounded-3" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
                        <h4 className="_comment_name_title" style={{ fontSize: '11.5px', fontWeight: 'bold', margin: 0 }}>
                          {reply.author.first_name} {reply.author.last_name}
                        </h4>
                        <p className="_comment_status_text mt-1" style={{ fontSize: '12px', margin: 0, color: '#444' }}>
                          {reply.content}
                        </p>
                        <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top" style={{ fontSize: '10px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <button 
                              onClick={() => handleLike(reply.id)} 
                              className="bg-transparent border-0 p-0 font-bold hover:text-emerald-600"
                              style={{ color: reply.liked ? '#10b981' : '#666', cursor: 'pointer' }}
                            >
                              Like
                            </button>
                            <span className="text-muted">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {reply.likes_count > 0 && (
                            <button 
                              onClick={() => {
                                setActiveLikes(reply.liked_by_users || []);
                                setLikesTitle('Reply Liked by');
                              }}
                              className="bg-transparent border-0 p-0 text-emerald-600 font-bold hover:underline"
                              style={{ cursor: 'pointer' }}
                            >
                              {reply.likes_count} likes
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <LikesModal
        isOpen={activeLikes !== null}
        onClose={() => setActiveLikes(null)}
        likes={activeLikes || []}
        title={likesTitle}
      />
    </div>
  );
}
