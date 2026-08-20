import React, { useState } from 'react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'student' | 'teacher' | 'admin';
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  userRole = 'student',
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does SmartAttend attendance verification work?',
      a: 'SmartAttend combines 4 independent local verification factors: (1) Single-device hardware keystore attestation, (2) 10-second rotating cryptographic dynamic QR code, (3) Classroom WiFi & GPS geofence boundary, and (4) Bluetooth Low Energy (BLE) proximity beacons.'
    },
    {
      q: 'Why does the QR code refresh every 10 seconds?',
      a: 'The 10-second rotating dynamic QR code contains a time-bound cryptographic nonces. This guarantees that students who are physically outside the classroom cannot take a photo of the QR code or share it over messaging apps to mark proxy attendance.'
    },
    {
      q: 'What happens if campus internet goes down during class?',
      a: 'SmartAttend includes an automatic Offline Classroom Fallback. Attendance is securely signed by your device keystore, cached locally on your device, and automatically synchronized to college servers once connectivity resumes.'
    },
    {
      q: 'How do I change my registered phone?',
      a: 'Because SmartAttend enforces a single-device anti-proxy policy, transferring your registered profile requires either a 2FA authorization token sent to your university email or administrator approval at the IT Helpdesk.'
    },
    {
      q: 'What should I do if my attendance is marked "Needs Review"?',
      a: 'If location or network jitter causes an anomaly, click the "Dispute / Correction" button on the record. Provide your row/seating notes. The course instructor will review the dispute against physical seating logs and approve the record.'
    },
    {
      q: 'Does AI Visual/Camera verification punish students automatically?',
      a: 'No. Visual verification is strictly non-punitive and serves only as supporting evidence. If a student is turned away, wearing a mask, or occluded, SmartAttend never marks them absent automatically; the final decision is always made by faculty.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">help_center</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Help & Support</h2>
              <p className="text-[11px] text-[#75777f]">SmartAttend Knowledge Base & FAQ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3f4f5] text-[#44474e] flex items-center justify-center hover:bg-[#e1e3e4] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {/* Quick Contact Card */}
          <div className="bg-[#eef2ff] border border-[#d8e2ff] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#031635]">
                University IT Helpdesk
              </span>
              <span className="text-[13px] font-bold text-[#001d36]">Aryabhata Tech Center, Room 102</span>
              <span className="text-[11px] text-[#75777f]">support@springfield.edu • Ext. 4410</span>
            </div>
            <span className="material-symbols-outlined text-[26px] text-[#031635]">support_agent</span>
          </div>

          {/* FAQs Accordion */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f] px-1">
              Frequently Asked Questions
            </span>

            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-3.5 text-left flex justify-between items-center gap-2 cursor-pointer hover:bg-[#f8f9fa]"
                  >
                    <span className="text-[13px] font-bold text-[#191c1d] leading-snug">{faq.q}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#75777f] shrink-0">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 text-[12px] text-[#44474e] border-t border-[#f3f4f5] leading-relaxed bg-[#fbfcfd]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* System Version */}
          <div className="text-center text-[10px] text-[#75777f] pt-2">
            SmartAttend v3.4.2 • Springfield College Enterprise Edition
          </div>
        </div>
      </div>
    </div>
  );
};
