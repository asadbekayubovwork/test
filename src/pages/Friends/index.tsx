import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { useFriendsStore } from '../../lib/stores';
import type { FriendListItem, FriendshipResponse } from '../../lib/api/friends';
import { isUuidString } from '../../lib/api/friends';
import type { Variants } from 'framer-motion';

function shortUid(uid: string): string {
  if (uid.length <= 12) return uid;
  return `${uid.slice(0, 8)}…${uid.slice(-4)}`;
}

function avatarUrlForUid(uid: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uid)}`;
}

interface FriendsPageFriendCardProps {
  friend: FriendListItem;
  itemVariants: Variants;
  onOpenDetail: (friendshipId: number) => void;
  metaLabel: string;
}

function FriendsPageFriendCard({
  friend,
  itemVariants,
  onOpenDetail,
  metaLabel,
}: FriendsPageFriendCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={() => onOpenDetail(friend.friendshipId)}
      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative">
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14 border-2 border-white dark:border-gray-700 shadow-sm"
          style={{ backgroundImage: `url("${avatarUrlForUid(friend.otherUid)}")` }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 dark:text-white font-semibold truncate font-mono text-sm">
          {shortUid(friend.otherUid)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">
          {metaLabel}
        </p>
      </div>

      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">
        chevron_right
      </span>
    </motion.div>
  );
}

function requestRowOtherUid(row: FriendshipResponse, kind: 'incoming' | 'outgoing'): string {
  return kind === 'incoming' ? row.requesterUid : row.addresseeUid;
}

const Friends = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetUid, setTargetUid] = useState('');
  const [uidTouched, setUidTouched] = useState(false);

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    isLoading,
    isProcessingRequest,
    error,
    fetchFriends,
    fetchFriendRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    clearError,
  } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, [fetchFriends, fetchFriendRequests]);

  const filteredFriends = friends.filter((friend) =>
    friend.otherUid.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const openAddModal = () => {
    setTargetUid('');
    setUidTouched(false);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setTargetUid('');
    setUidTouched(false);
  };

  const handleSendUidRequest = async () => {
    setUidTouched(true);
    if (!isUuidString(targetUid)) return;
    await sendRequest(targetUid.trim());
    if (!useFriendsStore.getState().error) {
      closeAddModal();
    }
  };

  if (isLoading && friends.length === 0 && activeTab === 'friends') {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-gray-50 dark:bg-background-dark">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">
              progress_activity
            </span>
            <p className="text-gray-500">{t('friends.loadingFriends')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-gray-900 dark:text-white text-xl font-bold">{t('friends.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input
              type="text"
              placeholder={t('friends.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'friends'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('friends.allTab', { count: friends.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('friends.requests')}
            {incomingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-between"
          >
            <span className="text-sm">{error}</span>
            <button type="button" onClick={clearError}>
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 pb-24 space-y-6"
      >
        {activeTab === 'requests' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h2 className="text-gray-900 dark:text-white text-base font-semibold mb-3">
                {t('friends.incomingRequests', { count: incomingRequests.length })}
              </h2>
              {incomingRequests.length > 0 ? (
                <div className="space-y-2">
                  {incomingRequests.map((request) => {
                    const uid = requestRowOtherUid(request, 'incoming');
                    return (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                      >
                        <div
                          className="w-12 h-12 rounded-full bg-center bg-cover shrink-0"
                          style={{
                            backgroundImage: `url("${avatarUrlForUid(uid)}")`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white font-medium font-mono text-sm truncate">
                            {shortUid(uid)}
                          </h3>
                          <p className="text-sm text-gray-500">{t('friends.pending')}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => acceptRequest(request.id)}
                            disabled={isProcessingRequest}
                            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectRequest(request.id)}
                            disabled={isProcessingRequest}
                            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                  <p>{t('friends.noIncoming')}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-gray-900 dark:text-white text-base font-semibold mb-3">
                {t('friends.sentRequests', { count: outgoingRequests.length })}
              </h2>
              {outgoingRequests.length > 0 ? (
                <div className="space-y-2">
                  {outgoingRequests.map((request) => {
                    const uid = requestRowOtherUid(request, 'outgoing');
                    return (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                      >
                        <div
                          className="w-12 h-12 rounded-full bg-center bg-cover shrink-0"
                          style={{
                            backgroundImage: `url("${avatarUrlForUid(uid)}")`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white font-medium font-mono text-sm truncate">
                            {shortUid(uid)}
                          </h3>
                          <p className="text-sm text-gray-500">{t('friends.pending')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelRequest(request.id)}
                          disabled={isProcessingRequest}
                          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium disabled:opacity-50 shrink-0"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2">outbox</span>
                  <p>{t('friends.noPending')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'friends' && (
          <>
            <motion.div variants={itemVariants}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-0.5">
                {t('friends.onlineUnavailableHint')}
              </p>
              <h2 className="text-gray-900 dark:text-white text-base font-semibold mb-3">
                {t('friends.allFriends')} ({filteredFriends.length})
              </h2>
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <FriendsPageFriendCard
                    key={friend.friendshipId}
                    friend={friend}
                    itemVariants={itemVariants}
                    onOpenDetail={(id) => navigate(`/friends/${id}`)}
                    metaLabel={t('friends.friendsSince', {
                      date: new Date(friend.createdAt).toLocaleDateString(),
                    })}
                  />
                ))}
              </div>

              {filteredFriends.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">
                    person_search
                  </span>
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-1">
                    {t('friends.noFriendsFound')}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchQuery
                      ? t('friends.tryDifferentSearch')
                      : t('friends.addToStart')}
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-3">
                  {t('friends.quickActions')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">group_add</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('friends.findFriends')}
                      </p>
                      <p className="text-xs text-gray-500">{t('friends.addByUserId')}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-500">share</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('friends.invite')}
                      </p>
                      <p className="text-xs text-gray-500">{t('friends.shareLink')}</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center"
            onClick={closeAddModal}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('friends.findFriends')}
                  </h2>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-gray-500">close</span>
                  </button>
                </div>
                <label className="block text-xs text-gray-500 mb-1.5">{t('friends.addByUserId')}</label>
                <input
                  type="text"
                  placeholder={t('friends.targetUidPlaceholder')}
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                {uidTouched && targetUid.trim() && !isUuidString(targetUid) && (
                  <p className="text-xs text-red-500 mt-2">{t('friends.invalidUid')}</p>
                )}
                <button
                  type="button"
                  onClick={handleSendUidRequest}
                  disabled={isProcessingRequest}
                  className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
                >
                  {isProcessingRequest ? '…' : t('friends.add')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
