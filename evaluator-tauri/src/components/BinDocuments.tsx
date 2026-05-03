import React, { useState, useEffect } from 'react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import { openUrl } from '@tauri-apps/plugin-opener';
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
      setStatus(`${cached.length} document(s) submitted (cached).`);
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
      const data = res.data;
      // Using tauri-plugin-opener to open in system default app
      await openUrl(data.url);
    } catch (err) {
      onShowModal({
        title: 'Open Failed',
        message: `Could not open document: ${err}`,
        type: 'danger'
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
      <button onClick={onBack} className="text-[#4A5568] hover:text-[#1A8C3C] mb-4">← Back to Bins</button>
      <h1 className="text-2xl font-serif mb-1">AY {bin.school_year} — {bin.semester} Semester</h1>
      <p className="text-xs text-gray-400 mb-6">{status}</p>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([scholarId, scholarDocs]) => (
          <div key={scholarId} className="bg-white p-6 rounded-lg border border-[#E0E6E0] shadow-sm">
            <p className="text-xs font-mono text-gray-500 mb-4">Scholar ID: {scholarId.slice(0, 8)}...</p>
            <div className="flex flex-col gap-3">
              {scholarDocs.map(doc => (
                <div key={doc.id} className="bg-[#F0F2F0] p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</p>
                    <p className="text-xs text-gray-600">{doc.file_name} · {doc.uploaded_at.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${doc.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>
                      {doc.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                    <button onClick={() => handleView(doc)} className="text-[#1A8C3C] font-semibold text-sm hover:underline">
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
