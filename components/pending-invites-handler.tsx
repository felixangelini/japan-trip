'use client';

import { useEffect, useState } from 'react';
import { usePendingInvites } from '@/hooks/use-itinerary-invites';
import { PendingInvitesModal } from './pending-invites-modal';

export function PendingInvitesHandler() {
  const { data: pendingInvites = [], isLoading } = usePendingInvites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownInvites, setHasShownInvites] = useState(false);

  // Auto-open modal when there are pending invites and we haven't shown them yet
  useEffect(() => {
    if (!isLoading && pendingInvites.length > 0 && !hasShownInvites) {
      setIsModalOpen(true);
      setHasShownInvites(true);
    }
  }, [pendingInvites, isLoading, hasShownInvites]);

  // Reset hasShownInvites when the number of pending invites changes
  useEffect(() => {
    if (pendingInvites.length === 0) {
      setHasShownInvites(false);
    }
  }, [pendingInvites.length]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Don't render anything if there are no pending invites
  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <PendingInvitesModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
    />
  );
} 