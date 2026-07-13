'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/types';
import Navbar from '@/components/feed/Navbar';
import LeftSidebar from '@/components/feed/LeftSidebar';
import PostCreator from '@/components/feed/PostCreator';
import TimelinePost from '@/components/feed/TimelinePost';
import RightSidebar from '@/components/feed/RightSidebar';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async (
    cursor: string | null = null,
    options: { replace?: boolean; refresh?: boolean } = {}
  ) => {
    const { replace = false, refresh = false } = options;

    if (refresh) {
      setRefreshing(true);
    } else if (replace && posts.length === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({ per_page: '10' });
      if (cursor) {
        params.set('cursor', cursor);
      }

      const data = await apiRequest(`/api/posts?${params.toString()}`);
      const nextPosts: Post[] = data.posts || [];
      const pagination = data.pagination || {};

      setPosts((currentPosts) => (replace ? nextPosts : [...currentPosts, ...nextPosts]));
      setNextCursor(pagination.next_cursor || null);
      setHasMore(Boolean(pagination.has_more));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts(null, { replace: true });
    }
  }, [user]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!user || loading || refreshing || loadingMore) return;
    if (!hasMore || !nextCursor) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - clientHeight - scrollTop < 300) {
        fetchPosts(nextCursor);
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    // Check immediately in case page is already near the bottom
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, nextCursor, loading, loadingMore, refreshing, user]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  };

  const handleRefresh = () => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPosts(null, { replace: true, refresh: true });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="_layout _layout_main_wrapper">
        <div className="_main_layout">
          <Navbar />

          <div className="container _custom_container">
            <div className="_layout_inner_wrap">
              <div className="row">
                <LeftSidebar />

                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                  <div className="_layout_middle_wrap" ref={scrollContainerRef}>
                    <div className="_layout_middle_inner">
                      <PostCreator onPostCreated={handlePostCreated} />

                      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em', margin: 0 }}>
                          Recent Feed
                        </h4>
                        <button
                          onClick={handleRefresh}
                          disabled={refreshing}
                          className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 font-bold text-xs"
                          style={{ color: '#10b981', cursor: 'pointer' }}
                        >
                          {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>

                      {loading ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="bg-white p-4 rounded-3 border text-center my-3">
                          <p className="text-muted mb-0">No posts in your feed yet. Be the first to share an update!</p>
                        </div>
                      ) : (
                        posts.map((post) => (
                          <TimelinePost
                            key={post.id}
                            post={post}
                            onPostUpdated={() => {
                              // Keep local UI responsive; background refresh is handled by pull/scroll actions.
                            }}
                          />
                        ))
                      )}

                      {hasMore && (
                        <div className="text-center py-4">
                          <button
                            type="button"
                            onClick={() => fetchPosts(nextCursor, { refresh: false })}
                            disabled={loadingMore || !nextCursor}
                            className="btn btn-success px-4"
                            style={{ borderRadius: '999px', fontWeight: 700 }}
                          >
                            {loadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
