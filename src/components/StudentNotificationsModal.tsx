import React from 'react';
import { StudentNotification } from '../types';

interface StudentNotificationsModalProps {
  notifications: StudentNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick?: (notif: StudentNotification) => void;
}

export const StudentNotificationsModal: React.FC<StudentNotificationsModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: StudentNotification['type']) => {
    switch (type) {
      case 'attendance':
        return { icon: 'verified', bg: 'bg-[#a0f399]', color: 'text-[#005312]' };
      case 'warning':
        return { icon: 'warning', bg: 'bg-[#ffdad6]', color: 'text-[#ba1a1a]' };
      case 'correction':
        return { icon: 'edit_document', bg: 'bg-[#eef2ff]', color: 'text-[#031635]' };
      case 'device':
        return { icon: 'phonelink_lock', bg: 'bg-[#d8e2ff]', color: 'text-[#001d36]' };
      case 'announcement':
        return { icon: 'campaign', bg: 'bg-[#ffdcc6]', color: 'text-[#723600]' };
      case 'failed':
      default:
        return { icon: 'cancel', bg: 'bg-[#ffdad6]', color: 'text-[#ba1a1a]' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Notifications</h2>
              <p className="text-[11px] text-[#75777f]">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-[#031635] hover:underline cursor-pointer bg-[#f8f9fa] px-2 py-1 rounded-lg border border-[#e1e3e4]"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f4f5] text-[#44474e] flex items-center justify-center hover:bg-[#e1e3e4] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-4 flex flex-col gap-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[#75777f]">
              <span className="material-symbols-outlined text-[36px] text-[#c5c6cf] mb-1">notifications_off</span>
              <p className="text-[13px] font-semibold">No notifications right now.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const iconCfg = getNotificationIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick && onNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    notif.isRead
                      ? 'bg-white border-[#e1e3e4] opacity-80 hover:opacity-100'
                      : 'bg-[#f8f9fc] border-[#031635]/20 shadow-xs'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${iconCfg.bg} ${iconCfg.color} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{iconCfg.icon}</span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={`text-[13px] font-bold ${notif.isRead ? 'text-[#191c1d]' : 'text-[#031635]'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#75777f] shrink-0 font-medium">{notif.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-[#44474e] mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#031635] shrink-0 mt-2" title="Unread" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
