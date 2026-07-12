import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Comment, Post, Reply } from '@/types';
import CommentSection from '@/components/feed/CommentSection';
import LikesModal from '@/components/feed/LikesModal';

interface PostCardProps {
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

export default function PostCard({ post, onPostUpdated }: PostCardProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const visibilityLabel = currentPost.visibility ? 'Public' : 'Private';

  const handleLikeToggle = async () => {
    if (liking) return;

    setLiking(true);
    try {
      const data = await apiRequest(`/api/posts/${currentPost.id}/like`, { method: 'POST' });
      setCurrentPost((prev) => ({
        ...prev,
        liked: data.liked,
        likes_count: data.likes_count,
        liked_by_users: data.liked_by_users,
      }));
      onPostUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentCreated = (createdComment: Comment | Reply, parentId: string | null) => {
    setCurrentPost((prev) => {
      const nextComments = parentId
        ? prev.comments.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...comment.replies, createdComment as Reply] }
              : comment
          )
        : [createdComment as Comment, ...prev.comments];

      return {
        ...prev,
        comments: nextComments,
        comments_count: prev.comments_count + 1,
      };
    });
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{currentPost.author.first_name} {currentPost.author.last_name}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatRelativeTime(currentPost.created_at)} . <a href="#0">{visibilityLabel}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button type="button" className="_feed_timeline_post_dropdown_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {currentPost.content && (
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{currentPost.content}</span>
            </p>
          </div>
        )}

        {currentPost.image_url && (
          <div className="_feed_inner_timeline_image mb-3" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={currentPost.image_url}
              alt="Post Image"
              className="_time_img"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=500';
              }}
            />
          </div>
        )}
      </div>

      <div className="_total_reactions">
        <div className="_total_react" onClick={() => setShowLikesModal(true)} role="button" tabIndex={0}>
          <span className="_reaction_like">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </span>
          <span className="_reaction_heart">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
        </div>
        <span className="_total">{currentPost.likes_count}</span>
      </div>

      <div className="_comment_reply">
        <div className="_comment_reply_num">
          <ul className="_comment_reply_list">
            <li>
              <button type="button" onClick={handleLikeToggle} disabled={liking} className="border-0 bg-transparent p-0">
                <span>{liking ? 'Like...' : currentPost.liked ? 'Liked' : 'Like'}</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setShowComments((current) => !current)} className="border-0 bg-transparent p-0">
                <span>Reply</span>
              </button>
            </li>
            <li>
              <button type="button" className="border-0 bg-transparent p-0" onClick={() => setShowComments((current) => !current)}>
                <span>Comment</span>
              </button>
            </li>
            <li>
              <span className="_time_link">.{formatRelativeTime(currentPost.created_at).replace(' ago', '')}</span>
            </li>
          </ul>
        </div>
      </div>

      {showComments && (
        <div className="_feed_inner_comment_box px-4 pb-3">
          <CommentSection
            postId={currentPost.id}
            comments={currentPost.comments}
            onCommentCreated={handleCommentCreated}
          />
        </div>
      )}

      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={currentPost.liked_by_users}
        title="Post Liked by"
      />
    </div>
  );
}
