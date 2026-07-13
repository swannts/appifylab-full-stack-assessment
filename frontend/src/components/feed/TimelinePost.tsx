'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Comment, Post, Reply, LikeUser } from '@/types';
import LikesModal from '@/components/feed/LikesModal';

interface TimelinePostProps {
  post: Post;
  onPostUpdated: () => void;
}

function formatRelativeTime(dateValue: string) {
  const createdAt = new Date(dateValue).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - createdAt) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

type LikeState = {
  liked: boolean;
  likes_count: number;
};

export default function TimelinePost({ post }: TimelinePostProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [activeLikes, setActiveLikes] = useState<LikeUser[] | null>(null);
  const [likesTitle, setLikesTitle] = useState('Liked by');
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const visibilityLabel = currentPost.visibility ? 'Public' : 'Private';

  const updateLikeState = (items: Comment[], targetId: string, likeState: LikeState): Comment[] => {
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

  const handleLikeToggle = async () => {
    if (likingPost) return;

    setLikingPost(true);
    try {
      const data = await apiRequest(`/api/posts/${currentPost.id}/like`, { method: 'POST' });
      setCurrentPost((prev) => ({
        ...prev,
        liked: data.liked,
        likes_count: data.likes_count,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLikingPost(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoadingComment(true);
    try {
      const data = await apiRequest(`/api/posts/${currentPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const createdComment = data.comment as Comment;

      setCurrentPost((prev) => ({
        ...prev,
        comments: [createdComment, ...prev.comments],
        comments_count: prev.comments_count + 1,
      }));
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoadingReply(true);
    try {
      const data = await apiRequest(`/api/posts/${currentPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: replyText.trim(),
          parent_id: parentId,
        }),
      });

      const createdReply = data.comment as Reply;

      setCurrentPost((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, createdReply] }
            : comment
        ),
        comments_count: prev.comments_count + 1,
      }));
      setReplyText('');
      setReplyToCommentId(null);
      setShowComments(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const data = await apiRequest(`/api/comments/${commentId}/like`, { method: 'POST' });
      setCurrentPost((prev) => ({
        ...prev,
        comments: updateLikeState(prev.comments, commentId, data),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const openLikesModal = async (fetchUrl: string, title: string) => {
    setLoadingLikes(true);
    try {
      const data = await apiRequest(fetchUrl, { method: 'GET' });
      setLikesTitle(title);
      setActiveLikes(data.likes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLikes(false);
    }
  };

  const topLevelComments = currentPost.comments.filter((comment) => !comment.parent_id);

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box d-flex align-items-center gap-2">
            <div className="bg-success text-white d-flex align-items-center justify-content-center font-bold" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              {currentPost.author.first_name[0].toUpperCase()}
              {currentPost.author.last_name[0].toUpperCase()}
            </div>
            <div className="_feed_inner_timeline_post_box_txt ms-2">
              <h4 className="_feed_inner_timeline_post_box_title" style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                {currentPost.author.first_name} {currentPost.author.last_name}
              </h4>
              <p className="_feed_inner_timeline_post_box_para" style={{ margin: 0, fontSize: '11px', color: '#999' }}>
                {formatRelativeTime(currentPost.created_at)} . <span className="text-success">{visibilityLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {currentPost.content && (
          <h4 className="_feed_inner_timeline_post_title" style={{ fontWeight: 'normal', fontSize: '14px', marginTop: '15px', marginBottom: '15px' }}>
            {currentPost.content}
          </h4>
        )}

        {currentPost.image_url && (
          <div className="_feed_inner_timeline_image mb-3" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img src={currentPost.image_url} alt="" className="_time_img" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="_feed_inner_timeline_total_reacts_image d-flex align-items-center gap-1 bg-transparent border-0 p-0"
          onClick={() => openLikesModal(`/api/posts/${currentPost.id}/likes`, 'Post Liked by')}
        >
          <img src="/assets/images/react_img1.png" alt="Image" className="_react_img1" />
          <p className="_feed_inner_timeline_total_reacts_para" style={{ margin: 0 }}>
            {currentPost.likes_count}
          </p>
        </button>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p
            className="_feed_inner_timeline_total_reacts_para1"
            style={{ margin: 0, cursor: 'pointer' }}
            onClick={() => setShowComments((current) => !current)}
          >
            <span>{currentPost.comments_count}</span> Comments
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction d-flex border-top border-bottom py-1 my-2">
        <button
          onClick={handleLikeToggle}
          disabled={likingPost}
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction border-0 bg-transparent flex-fill py-2 text-center ${currentPost.liked ? '_feed_reaction_active' : ''}`}
          style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>{likingPost ? 'Updating...' : currentPost.liked ? 'Liked' : 'Like'}</span>
          </span>
        </button>
        <button
          onClick={() => setShowComments((current) => !current)}
          className="_feed_inner_timeline_reaction_comment _feed_reaction border-0 bg-transparent flex-fill py-2 text-center"
          style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>Comment</span>
          </span>
        </button>
      </div>

      {showComments && (
        <div className="_feed_inner_timeline_cooment_area px-4">
          <div className="_feed_inner_comment_box mb-3">
            <form onSubmit={handleCommentSubmit} className="_feed_inner_comment_box_form">
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    className="form-control _comment_textarea"
                    placeholder="Write a comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ height: '38px', padding: '6px 12px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit(e);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="_feed_inner_comment_box_icon">
                <button type="button" className="_feed_inner_comment_box_icon_btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
                  </svg>
                </button>
                <button type="button" className="_feed_inner_comment_box_icon_btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M12.916 2c1.71 0 2.584 1.135 2.584 2.914v6.17c0 1.787-1.127 2.916-2.584 2.916H3.084C1.627 14 .5 12.871.5 11.084V4.914C.5 3.135 1.627 2 3.084 2h9.832zm0 1H3.084C2.158 3 1.5 3.864 1.5 5.204v5.592C1.5 12.136 2.158 13 3.084 13h9.832c.926 0 1.584-.864 1.584-2.204V5.204C14.5 3.864 13.842 3 12.916 3zm.186 6.837c.365-.304.91-.32 1.29-.036l.095.083 1.025 1c.148.145.196.368.12.56l-.045.086c-.147.218-.4.32-.656.257l-.096-.036-1.025-1a.591.591 0 00-.63-.075l-.088.058-2.023 1.705c-.328.277-.802.327-1.18.126l-.097-.063-2.003-1.6c-.365-.291-.892-.284-1.25.016l-.088.083-1.05 1.074a.498.498 0 01-.735.034.587.587 0 01-.033-.787l.044-.047 1.05-1.074c.646-.66 1.688-.702 2.383-.127l.1.096 1.996 1.594c.058.046.126.06.188.043l.067-.027 2.03-1.71a1.591 1.591 0 012.016-.067zM5.334 4.5A1.333 1.333 0 114 5.833 1.333 1.333 0 015.334 4.5zm0 .937a.396.396 0 100 .792.396.396 0 000-.792z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="_timline_comment_main" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {topLevelComments.map((comment) => {
              const commentInitials = `${comment.author.first_name[0].toUpperCase()}${comment.author.last_name[0].toUpperCase()}`;
              return (
                <div key={comment.id} className="_comment_block mb-3">
                  <div className="_comment_main">
                    <div className="_comment_image">
                      <span className="_comment_image_link">
                        <div className="bg-success text-white d-flex align-items-center justify-content-center font-bold text-xs" style={{ width: '32px', height: '32px', borderRadius: '50%' }}>
                          {commentInitials}
                        </div>
                      </span>
                    </div>
                    <div className="_comment_area">
                      <div className="_comment_details">
                        <div className="_comment_details_top">
                          <div className="_comment_name">
                            <span>
                              <h4 className="_comment_name_title">{comment.author.first_name} {comment.author.last_name}</h4>
                            </span>
                          </div>
                        </div>
                        <div className="_comment_status">
                          <p className="_comment_status_text"><span>{comment.content}</span></p>
                        </div>
                        <div className="_comment_reply">
                          <div className="_comment_reply_num">
                            <ul className="_comment_reply_list">
                              <li>
                                <button
                                  type="button"
                                  style={{ cursor: 'pointer', fontWeight: 'bold', background: 'transparent', border: 0, padding: 0 }}
                                  onClick={() => handleCommentLike(comment.id)}
                                >
                                  {comment.liked ? 'Liked' : 'Like'}
                                </button>
                              </li>
                              <li>
                                <span
                                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                  onClick={() => {
                                    setReplyToCommentId(replyToCommentId === comment.id ? null : comment.id);
                                    setReplyText('');
                                  }}
                                >
                                  Reply
                                </span>
                              </li>
                              {comment.likes_count > 0 && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => openLikesModal(`/api/comments/${comment.id}/likes`, 'Comment Liked by')}
                                    style={{ cursor: 'pointer', fontWeight: 'bold', background: 'transparent', border: 0, padding: 0 }}
                                  >
                                    {comment.likes_count} likes
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {replyToCommentId === comment.id && (
                        <div className="_feed_inner_comment_box mt-2">
                          <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="_feed_inner_comment_box_form">
                            <div className="_feed_inner_comment_box_content">
                              <div className="_feed_inner_comment_box_content_image">
                                <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
                              </div>
                              <div className="_feed_inner_comment_box_content_txt">
                                <textarea
                                  className="form-control _comment_textarea"
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  style={{ height: '38px', padding: '6px 12px' }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleReplySubmit(e, comment.id);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="_feed_inner_comment_box_icon">
                              <button type="button" className="_feed_inner_comment_box_icon_btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                  <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button type="button" className="_feed_inner_comment_box_icon_btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                  <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M12.916 2c1.71 0 2.584 1.135 2.584 2.914v6.17c0 1.787-1.127 2.916-2.584 2.916H3.084C1.627 14 .5 12.871.5 11.084V4.914C.5 3.135 1.627 2 3.084 2h9.832zm0 1H3.084C2.158 3 1.5 3.864 1.5 5.204v5.592C1.5 12.136 2.158 13 3.084 13h9.832c.926 0 1.584-.864 1.584-2.204V5.204C14.5 3.864 13.842 3 12.916 3zm.186 6.837c.365-.304.91-.32 1.29-.036l.095.083 1.025 1c.148.145.196.368.12.56l-.045.086c-.147.218-.4.32-.656.257l-.096-.036-1.025-1a.591.591 0 00-.63-.075l-.088.058-2.023 1.705c-.328.277-.802.327-1.18.126l-.097-.063-2.003-1.6c-.365-.291-.892-.284-1.25.016l-.088.083-1.05 1.074a.498.498 0 01-.735.034.587.587 0 01-.033-.787l.044-.047 1.05-1.074c.646-.66 1.688-.702 2.383-.127l.1.096 1.996 1.594c.058.046.126.06.188.043l.067-.027 2.03-1.71a1.591 1.591 0 012.016-.067zM5.334 4.5A1.333 1.333 0 114 5.833 1.333 1.333 0 015.334 4.5zm0 .937a.396.396 0 100 .792.396.396 0 000-.792z" />
                                </svg>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="_replies_wrapper" style={{ marginLeft: '45px', marginTop: '10px' }}>
                      {comment.replies.map((reply) => {
                        const replyInitials = `${reply.author.first_name[0].toUpperCase()}${reply.author.last_name[0].toUpperCase()}`;
                        return (
                          <div key={reply.id} className="_comment_main mb-2">
                            <div className="_comment_image">
                              <span className="_comment_image_link">
                                <div className="bg-success text-white d-flex align-items-center justify-content-center font-bold text-xs" style={{ width: '28px', height: '28px', borderRadius: '50%' }}>
                                  {replyInitials}
                                </div>
                              </span>
                            </div>
                            <div className="_comment_area">
                              <div className="_comment_details">
                                <div className="_comment_details_top">
                                  <div className="_comment_name">
                                    <span>
                                      <h4 className="_comment_name_title" style={{ fontSize: '11px' }}>{reply.author.first_name} {reply.author.last_name}</h4>
                                    </span>
                                  </div>
                                </div>
                                <div className="_comment_status">
                                  <p className="_comment_status_text"><span style={{ fontSize: '12px' }}>{reply.content}</span></p>
                                </div>
                                <div className="_comment_reply">
                                  <div className="_comment_reply_num">
                                    <ul className="_comment_reply_list">
                                      <li>
                                        <button
                                          type="button"
                                          onClick={() => handleCommentLike(reply.id)}
                                          style={{ cursor: 'pointer', fontWeight: 'bold', background: 'transparent', border: 0, padding: 0 }}
                                        >
                                          {reply.liked ? 'Liked' : 'Like'}
                                        </button>
                                      </li>
                                      {reply.likes_count > 0 && (
                                        <li>
                                          <button
                                            type="button"
                                            onClick={() => openLikesModal(`/api/comments/${reply.id}/likes`, 'Reply Liked by')}
                                            style={{ cursor: 'pointer', fontWeight: 'bold', background: 'transparent', border: 0, padding: 0 }}
                                          >
                                            {reply.likes_count} likes
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <LikesModal
        isOpen={activeLikes !== null || loadingLikes}
        onClose={() => setActiveLikes(null)}
        likes={activeLikes || []}
        title={likesTitle}
      />
    </div>
  );
}
