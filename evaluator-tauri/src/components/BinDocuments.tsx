import React, { useState, useEffect } from 'react';
import { openPath } from '@tauri-apps/plugin-opener';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import { DocumentService } from '../services/documentService';
import api from '../services/apiService';
import { ModalProps } from './shared/Modal';

interface Document {
  id: string;
  scholar_id: string;
  doc_type: string;
  file_name: string;
  uploaded_at: string;
  is_verified: boolean;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  COR: "Certificate of Registration",
  ROG: "Report of Grades",
  explanation_letter: "Personal Letter",
  completion_form: "Completion Form",
  other: "Other",
};

interface BinDocumentsProps {
  bin: { id: string, school_year: string, semester: string };
  onBack: () => void;
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const BinDocuments: React.FC<BinDocumentsProps> = ({ bin, onBack, onShowModal }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [status, setStatus] = useState("Loading documents...");

  useEffect(() => {
    loadDocuments();
  }, [bin.id]);

  const loadDocuments = async () => {
    const CACHE_KEY = `documents/bin_${bin.id}`;
    const cached = CacheService.get<Document[]>(CACHE_KEY);

    if (cached) {
      setDocs(cached);
      setStatus(`${cached.length} document(s) submitted.`);
      return;
    }

    setStatus("Loading documents...");
    const isOnline = await NetworkStatus.checkApiConnection();

    if (isOnline) {
      try {
        const res = await api.get(`/documents/bin/${bin.id}`);
        const data = res.data;
        setDocs(data);
        CacheService.set(CACHE_KEY, data);
        setStatus(`${data.length} document(s) submitted.`);
      } catch (err) {
        setStatus(`Error loading docs: ${err}`);
      }
    }
  };

  const handleView = async (doc: Document) => {
    try {
      const res = await api.get(`/documents/${doc.id}/view-evaluator`);
      const localPath = await DocumentService.downloadAndCacheDocument(doc.id, doc.scholar_id, res.data.url);
      const normalizedPath = localPath.replace(/\\/g, '/');
      
      // Use the opener plugin to open the file in the default viewer
      await openPath(normalizedPath);
    } catch (err) {
      console.error("Preview handleView error:", err);
      const errText = String(err);
      const message = errText.includes('forbidden path')
        ? 'Could not open document because the cache path is not permitted yet. Please re-select your cache folder in Settings (any directory is allowed), restart the app, then try again.'
        : `Could not open document: ${err}`;
      onShowModal({
        title: 'Open Failed',
        message,
        type: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const grouped = docs.reduce((acc, doc) => {
    if (!acc[doc.scholar_id]) acc[doc.scholar_id] = [];
    acc[doc.scholar_id].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="p-8">
      <button onClick={onBack} className="text-[#4A5568] dark:text-dark-text-sec hover:text-[#1A8C3C] text-sm mb-6 flex items-center gap-2 font-semibold">
        ← Back to All Bins
      </button>

      <div className="mb-8">
        <h1 className="text-2xl text-[#1A1A1A] dark:text-dark-text">AY {bin.school_year} — {bin.semester} Semester</h1>
        <p className="text-[10px] uppercase font-bold tracking-wider text-[#A0AEC0] dark:text-dark-text-muted mt-1">{status}</p>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([scholarId, scholarDocs]) => (
          <div key={scholarId} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#F0F2F0] dark:border-dark-border">
              <div className="w-10 h-10 rounded-full bg-[#E8F5ED] dark:bg-dark-green-bg flex items-center justify-center text-[#1A8C3C] font-bold text-sm">
                {scholarId.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs font-mono text-[#A0AEC0] dark:text-dark-text-muted">Scholar ID: {scholarId}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {scholarDocs.map(doc => (
                <div key={doc.id} className="bg-[#F7F9F7] dark:bg-dark-surface p-4 rounded-xl flex items-center justify-between border border-[#E0E6E0]/50 dark:border-dark-border/50 hover:border-[#1A8C3C]/30 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A1A] dark:text-dark-text">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</p>
                    <p className="text-[11px] text-[#4A5568] dark:text-dark-text-sec mt-0.5">{doc.file_name} • {doc.uploaded_at.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${doc.is_verified ? 'bg-[#E8F5ED] text-[#1A8C3C] dark:bg-dark-green-badge dark:text-dark-green' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-dark-text-sec'}`}>
                      {doc.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    <button onClick={() => handleView(doc)} className="text-[#1A8C3C] dark:text-dark-green font-semibold text-sm hover:underline">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
