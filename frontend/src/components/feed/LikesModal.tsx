import React from 'react';
import { LikeUser } from '@/types';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: LikeUser[];
  title?: string;
}

export default function LikesModal({ isOpen, onClose, likes, title = 'Liked by' }: LikesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '16px', border: '0', overflow: 'hidden' }}>
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              {title}
            </h5>
            <button type="button" className="btn-close border-0 bg-transparent" onClick={onClose} style={{ fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {likes.length === 0 ? (
              <p className="text-center text-muted py-3">No likes yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {likes.map((user) => (
                  <div key={user.id} className="d-flex align-items-center gap-3">
                    <div className="text-white d-flex align-items-center justify-content-center font-bold text-sm bg-success" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="font-semibold" style={{ fontSize: '14px' }}>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
