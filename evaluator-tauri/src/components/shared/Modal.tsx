import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={48} className="text-[#1A8C3C]" />,
          bg: 'bg-green-50',
          btn: 'bg-[#1A8C3C] hover:bg-[#147030]',
          title: 'text-[#1A8C3C]',
        };
      case 'danger':
        return {
          icon: <AlertCircle size={48} className="text-red-600" />,
          bg: 'bg-red-50',
          btn: 'bg-red-600 hover:bg-red-700',
          title: 'text-red-700',
        };
      default:
        return {
          icon: <Info size={48} className="text-blue-600" />,
          bg: 'bg-blue-50',
          btn: 'bg-[#1A8C3C] hover:bg-[#147030]',
          title: 'text-gray-900',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onCancel}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-8 ${styles.bg}`}>
          <div className="mb-4">{styles.icon}</div>
          <h2 className={`text-2xl font-bold mb-2 ${styles.title}`}>{title}</h2>
          <p className="text-[#4A5568] leading-relaxed">{message}</p>
        </div>
        
        <div className="p-6 bg-white flex justify-end gap-3">
          {cancelLabel && (
            <button 
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl font-semibold text-[#4A5568] hover:bg-gray-100 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className={`px-8 py-2.5 rounded-xl font-semibold text-white transition-all shadow-md active:scale-95 ${styles.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
