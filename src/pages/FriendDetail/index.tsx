import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';
import { useFriendsStore } from '../../lib/stores/friendsStore';

const FriendDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const {
    selectedFriend: friend,
    isLoadingFriend,
    error,
    fetchFriendById,
    removeFriendById,
    isProcessingRequest,
  } = useFriendsStore();

  useEffect(() => {
    if (id) {
      fetchFriendById(Number(id));
    }
  }, [id, fetchFriendById]);

  const copyUid = async () => {
    if (!friend?.otherUid || !navigator.clipboard) return;
    await navigator.clipboard.writeText(friend.otherUid);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingFriend) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('friendDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !friend) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center px-4">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3">error</span>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{t('common.somethingWentWrong')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button type="button" onClick={() => navigate('/friends')} className="text-primary font-bold">
            {t('friendDetail.backToFriends')}
          </button>
        </div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">person_off</span>
          <p className="text-gray-500 dark:text-gray-400">{t('friendDetail.friendNotFound')}</p>
          <button
            type="button"
            onClick={() => navigate('/friends')}
            className="mt-4 text-primary font-bold"
          >
            {t('friendDetail.backToFriends')}
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friend.otherUid)}`;

  const handleRemoveFriend = async () => {
    if (window.confirm(t('friendDetail.removeFriendConfirmSimple'))) {
      await removeFriendById(friend.friendshipId);
      if (!useFriendsStore.getState().error) {
        navigate('/friends');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="relative">
        <div
          className="w-full h-40 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'linear-gradient(135deg, #3713ec 0%, #7c3aed 100%)',
          }}
        />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            type="button"
            onClick={handleRemoveFriend}
            disabled={isProcessingRequest}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-50"
          >
            <span className="material-symbols-outlined">
              {isProcessingRequest ? 'hourglass_empty' : 'person_remove'}
            </span>
          </button>
        </div>

        <div className="relative -mt-16 mx-4 z-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full bg-center bg-cover border-4 border-white dark:border-gray-700 shadow-md mb-4"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {t('friendDetail.userAccountId')}
              </h1>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all px-1">
                {friend.otherUid}
              </p>
              <button
                type="button"
                onClick={copyUid}
                className="mt-3 text-sm text-primary font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                {copied ? t('friendDetail.copied') : t('friendDetail.copyId')}
              </button>
              <p className="text-xs text-gray-500 mt-4">
                {t('friends.friendsSince', {
                  date: new Date(friend.createdAt).toLocaleDateString(),
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-8" />
    </div>
  );
};

export default FriendDetail;
