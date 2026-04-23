import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useApiCache } from '../hooks/useApiCache';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { data: profile } = useApiCache('profile', 'http://localhost:8000/scholars/me');
  const { data: documents, fetcher: fetchDocuments } = useApiCache('documents', 'http://localhost:8000/documents/me');

  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});

  const triggerUpload = (docType) => {
      setUploadTarget(docType);
      fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file || !uploadTarget) return;
      
      setUploadStatus(prev => ({ ...prev, [uploadTarget]: 'uploading' }));
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', uploadTarget);
      
      try {
          const token = localStorage.getItem('token');
          await axios.post('http://localhost:8000/documents/upload', formData, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          });
          setUploadStatus(prev => ({ ...prev, [uploadTarget]: 'success' }));
          
          await fetchDocuments();
      } catch(err) {
          setUploadStatus(prev => ({ ...prev, [uploadTarget]: 'error' }));
      } finally {
          e.target.value = null; 
      }
  };

  const handleViewDocument = async (docId) => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:8000/documents/${docId}/view`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          window.open(res.data.url, '_blank');
      } catch (err) { }
  };

  if (!profile || !documents) return (
    <Layout>
      <div className="flex justify-center items-center h-[60vh] text-primary">Loading interface...</div>
    </Layout>
  );

  return (
    <Layout>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/jpeg,image/png,application/pdf" className="hidden" />
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold font-headline text-on-surface">Welcome back, {profile.first_name}</h2>
        <p className="text-on-surface-variant text-sm mt-1">Keep your documentation up to date to maintain your grant.</p>
      </section>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-[32px] shadow-lg text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 block mb-2">Current Standing</span>
            <h3 className="text-3xl font-extrabold font-headline">{profile.status.toUpperCase()}</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
              <span className="text-sm font-medium">{profile.course} • Batch {profile.batch_number}</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant">Required Submissions</h4>
        </div>
        
        <div className="space-y-4">
          {/* COR Bin */}
          <div className="bg-surface-container-lowest p-5 rounded-[28px] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-bold text-on-surface">Certificate of Registration (COR)</h5>
              <p className="text-xs text-on-surface-variant">Must be a valid PDF for this semester</p>
            </div>
            <button 
               onClick={() => triggerUpload('COR')}
               disabled={uploadStatus['COR'] === 'uploading'}
               className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-primary-container transition-colors scale-95 active:duration-150 relative"
               style={{opacity: uploadStatus['COR'] === 'uploading' ? 0.7 : 1}}>
                 {uploadStatus['COR'] === 'uploading' ? 'Uploading...' : uploadStatus['COR'] === 'success' ? 'Uploaded!' : 'Upload'}
            </button>
          </div>
          
          {/* ROG Bin */}
          <div className="bg-surface-container-lowest p-5 rounded-[28px] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">grade</span>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-bold text-on-surface">Report of Grades (ROG)</h5>
              <p className="text-xs text-on-surface-variant">Scanned copy of your official grades</p>
            </div>
            <button 
               onClick={() => triggerUpload('ROG')}
               disabled={uploadStatus['ROG'] === 'uploading'}
               className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-primary-container transition-colors scale-95 active:duration-150"
               style={{opacity: uploadStatus['ROG'] === 'uploading' ? 0.7 : 1}}>
                 {uploadStatus['ROG'] === 'uploading' ? 'Uploading...' : uploadStatus['ROG'] === 'success' ? 'Uploaded!' : 'Upload'}
            </button>
          </div>
          
          {/* Optional Letter Bin */}
          <div className="bg-surface-container/50 border-2 border-dashed border-outline-variant p-5 rounded-[28px] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-on-surface">Personal Letter</h5>
                <span className="text-[10px] text-on-surface-variant/60 font-medium italic">Optional</span>
              </div>
              <p className="text-xs text-on-surface-variant">Update the board on your progress</p>
            </div>
            <button 
               onClick={() => triggerUpload('LETTER')}
               disabled={uploadStatus['LETTER'] === 'uploading'}
               className="text-primary hover:bg-primary-fixed px-4 py-2 rounded-full text-xs font-bold transition-colors scale-95 active:duration-150"
               style={{opacity: uploadStatus['LETTER'] === 'uploading' ? 0.7 : 1}}>
                 {uploadStatus['LETTER'] === 'uploading' ? 'Uploading...' : uploadStatus['LETTER'] === 'success' ? 'Uploaded!' : 'Upload'}
            </button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h4 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">Previous Submissions</h4>
        
        <details className="group/accordion bg-surface-container-lowest rounded-[24px] overflow-hidden shadow-sm border border-surface-container-low" open>
          <summary className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">folder</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Uploaded History</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{documents.length} FILES UPLOADED</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300 expand-icon">expand_more</span>
            </div>
          </summary>
          
          <div className="bg-surface-container-low/20 px-2 pb-2 space-y-1">
             {documents.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">No records found</div>
             ) : documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer group/file" onClick={() => handleViewDocument(doc.id)}>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                         <span className="material-symbols-outlined text-on-surface-variant text-base">description</span>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-on-surface">{doc.file_name}</p>
                         <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${doc.is_verified ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant'}`}>{doc.is_verified ? 'Verified' : 'Pending'}</span>
                       <span className="material-symbols-outlined text-on-surface-variant group-hover/file:text-primary text-lg">visibility</span>
                   </div>
                </div>
             ))}
          </div>
        </details>
      </section>
    </Layout>
  );
};

export default Dashboard;
