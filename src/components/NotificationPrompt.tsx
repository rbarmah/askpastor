import React from 'react';

interface NotificationPromptProps {
  trigger: string;
  onClose: () => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ trigger, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Stay Updated!</h3>
          <p className="text-sm text-slate-600">
            {trigger === 'question_submitted'
              ? "Get notified when Pastor Stefan answers your question."
              : "Get notified about new content from Pastor Stefan."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all text-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission();
              }
              onClose();
            }}
            className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all text-sm"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
