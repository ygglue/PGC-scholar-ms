import { useState, useRef } from "react";
import apiClient, { API_BASE } from "../config/api";
import Layout from "../components/Layout";
import { useApiCache } from "../hooks/useApiCache";

// Upload cards for a single bin
const BinUploadSection = ({ bin, binDocs, uploadStatus, triggerUpload }) => {
  const binCOR = binDocs.find((d) => d.doc_type === "COR");
  const binROG = binDocs.find((d) => d.doc_type === "ROG");
  const binLetter = binDocs.find((d) => d.doc_type === "explanation_letter");

  const keyPrefix = bin.id; // unique key per bin to avoid status collision

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-base">
          inbox
        </span>
        <span className="text-xs font-bold text-primary bg-primary-pale px-3 py-1 rounded-full">
          AY {bin.school_year} — {bin.semester} Sem
        </span>
      </div>

      <div className="space-y-3">
        {/* COR */}
        <div
          className={`p-5 rounded-[28px] flex items-center gap-4 transition-all ${binCOR ? "bg-surface-high/50 opacity-60 border border-outline/50" : "bg-surface-container-lowest shadow-sm hover:shadow-md"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-pale flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-on-surface">
              Certificate of Registration (COR)
            </h5>
            {binCOR ? (
              <p className="text-xs text-on-surface-variant font-medium">
                {binCOR.file_name} • Uploaded{" "}
                {new Date(binCOR.uploaded_at).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Must be a valid PDF for this semester
              </p>
            )}
          </div>
          <button
            onClick={() => triggerUpload("COR", bin.id, binCOR?.id)}
            disabled={uploadStatus[`${keyPrefix}-COR`] === "uploading"}
            className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-primary-dark transition-colors"
            style={{
              opacity:
                uploadStatus[`${keyPrefix}-COR`] === "uploading" ? 0.7 : 1,
            }}
          >
            {uploadStatus[`${keyPrefix}-COR`] === "uploading"
              ? "Uploading..."
              : binCOR
                ? "Replace"
                : "Upload"}
          </button>
        </div>

        {/* ROG */}
        <div
          className={`p-5 rounded-[28px] flex items-center gap-4 transition-all ${binROG ? "bg-surface-high/50 opacity-60 border border-outline/50" : "bg-surface-container-lowest shadow-sm hover:shadow-md"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-pale flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">grade</span>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-on-surface">
              Report of Grades (ROG)
            </h5>
            {binROG ? (
              <p className="text-xs text-on-surface-variant font-medium">
                {binROG.file_name} • Uploaded{" "}
                {new Date(binROG.uploaded_at).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Scanned copy of your official grades
              </p>
            )}
          </div>
          <button
            onClick={() => triggerUpload("ROG", bin.id, binROG?.id)}
            disabled={uploadStatus[`${keyPrefix}-ROG`] === "uploading"}
            className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-primary-dark transition-colors"
            style={{
              opacity:
                uploadStatus[`${keyPrefix}-ROG`] === "uploading" ? 0.7 : 1,
            }}
          >
            {uploadStatus[`${keyPrefix}-ROG`] === "uploading"
              ? "Uploading..."
              : binROG
                ? "Replace"
                : "Upload"}
          </button>
        </div>

        {/* Letter */}
        <div
          className={`border-2 border-dashed border-[#b0b8b0] dark:border-[#555] p-5 rounded-[28px] flex items-center gap-4 transition-all ${binLetter ? "bg-surface-high/30 opacity-60" : "bg-surface-high/50"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-high flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold text-on-surface">
                Personal Letter
              </h5>
              <span className="text-[10px] text-on-surface-variant/60 font-medium italic">
                Optional
              </span>
            </div>
            {binLetter ? (
              <p className="text-xs text-on-surface-variant font-medium">
                {binLetter.file_name} • Uploaded{" "}
                {new Date(binLetter.uploaded_at).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Update the board on your progress
              </p>
            )}
          </div>
          <button
            onClick={() =>
              triggerUpload("explanation_letter", bin.id, binLetter?.id)
            }
            disabled={
              uploadStatus[`${keyPrefix}-explanation_letter`] === "uploading"
            }
            className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-primary-dark transition-colors"
            style={{
              opacity:
                uploadStatus[`${keyPrefix}-explanation_letter`] === "uploading"
                  ? 0.7
                  : 1,
            }}
          >
            {uploadStatus[`${keyPrefix}-explanation_letter`] === "uploading"
              ? "Uploading..."
              : binLetter
                ? "Replace"
                : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data: profile } = useApiCache("profile", `${API_BASE}/scholars/me`);
  const { data: documents, fetcher: fetchDocuments } = useApiCache(
    "documents",
    `${API_BASE}/documents/me`,
  );
  const { data: bins } = useApiCache(
    "submission_bins",
    `${API_BASE}/submission-bins/`,
  );

  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});

  // uploadTarget: { docType, binId, oldDocId }
  const triggerUpload = (docType, binId, oldDocId = null) => {
    setUploadTarget({ docType, binId, oldDocId });
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    const { docType, binId, oldDocId } = uploadTarget;
    const statusKey = `${binId}-${docType}`;
    setUploadStatus((prev) => ({ ...prev, [statusKey]: "uploading" }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    formData.append("submission_bin_id", binId);

    try {
      await apiClient.post(`${API_BASE}/documents/upload`, formData);
      if (oldDocId) {
        try {
          await apiClient.delete(`${API_BASE}/documents/${oldDocId}`);
        } catch (delErr) {
          console.warn("Failed to delete old document:", delErr);
        }
      }
      setUploadStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      await fetchDocuments();
    } catch (err) {
      setUploadStatus((prev) => ({ ...prev, [statusKey]: "error" }));
    } finally {
      e.target.value = null;
    }
  };

  const handleViewDocument = async (docId) => {
    try {
      const res = await apiClient.get(`${API_BASE}/documents/${docId}/view`);
      window.open(res.data.url, "_blank");
    } catch (err) {}
  };

  // Group documents by bin for Previous Submissions history
  const groupedByBin = (documents || []).reduce((acc, doc) => {
    const binId = doc.submission_bin_id || "__unassigned__";
    const label = doc.submission_bin
      ? `AY ${doc.submission_bin.school_year} — ${doc.submission_bin.semester} Sem`
      : "Unassigned";
    if (!acc[binId]) acc[binId] = { label, docs: [] };
    acc[binId].docs.push(doc);
    return acc;
  }, {});

  const sortedBinGroups = Object.entries(groupedByBin).sort(([, a], [, b]) => {
    if (a.label === "Unassigned") return 1;
    if (b.label === "Unassigned") return -1;
    return b.label.localeCompare(a.label);
  });

  // Active bins are all non-approved bins (backend already filters for scholars)
  const activeBins = bins || [];

  if (!profile || !documents || !bins)
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh] text-primary">
          Loading interface...
        </div>
      </Layout>
    );

  return (
    <Layout>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
      />

      <section className="mb-8">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          Welcome back, {profile.first_name}
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Keep your documentation up to date to maintain your grant.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-grad to-primary-grad-to p-6 rounded-[32px] shadow-lg text-on-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl translate-x-12 -translate-y-12" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 block mb-2">
              Current Standing
            </span>
            <h3 className="text-3xl font-extrabold font-headline">
              {profile.status.toUpperCase()}
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                verified
              </span>
              <span className="text-sm font-medium">
                {profile.course} • Batch {profile.batch_number}
              </span>
            </div>
          </div>

          {/* Blob decorations */}
          <div className="absolute z-0 w-48 h-48 rounded-full bg-primary-light/25 blur-2xl -left-16 -top-16" />
          <div className="absolute z-0 w-40 h-40 rounded-full bg-gold/35 blur-xl -right-20 -top-10" />
          <div className="absolute z-0 w-36 h-36 rounded-full bg-primary-mid/30 blur-2xl -left-8 bottom-4" />
          <div className="absolute z-0 w-44 h-44 rounded-full bg-gold-light/20 blur-xl -right-12 bottom-0" />

          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Required Submissions — one section per active bin */}
      <section className="mb-10">
        <h4 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">
          Required Submissions
        </h4>

        {activeBins.length === 0 ? (
          <div className="bg-surface-high/50 border-2 border-dashed border-outline rounded-[28px] p-8 text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2 block">
              inbox
            </span>
            <p className="text-sm font-bold text-on-surface">
              No Submission Bins yet
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Your evaluator hasn't opened a submission window.
            </p>
          </div>
        ) : (
          activeBins.map((bin) => (
            <BinUploadSection
              key={bin.id}
              bin={bin}
              binDocs={(documents || []).filter(
                (d) => d.submission_bin_id === bin.id,
              )}
              uploadStatus={uploadStatus}
              triggerUpload={triggerUpload}
            />
          ))
        )}
      </section>

      {/* Previous Submissions — grouped by bin (history) */}
      <section className="mb-12">
        <h4 className="text-sm font-bold uppercase tracking-wide text-on-surface-variant mb-4">
          Previous Submissions
        </h4>

        {sortedBinGroups.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant text-sm">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBinGroups.map(([binId, { label, docs }]) => (
              <details
                key={binId}
                className="group/accordion bg-surface-container-lowest rounded-[24px] overflow-hidden shadow-sm border border-outline/50"
              >
                <summary className="w-full flex items-center justify-between p-4 hover:bg-surface-high/30 transition-colors cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-pale/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">folder</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-on-surface">
                        {label}
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        {docs.length} FILE{docs.length !== 1 ? "S" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300">
                    expand_more
                  </span>
                </summary>

                <div className="bg-surface-alt/20 px-2 pb-2 pt-1 space-y-1">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-lowest transition-colors cursor-pointer group/file"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-high/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-base">
                            {doc.doc_type === "COR"
                              ? "description"
                              : doc.doc_type === "ROG"
                                ? "grade"
                                : "mail"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">
                            {doc.file_name}
                          </p>
                          <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${doc.is_verified ? "bg-primary-pale text-primary-dark" : "bg-surface-high text-on-surface-variant"}`}
                        >
                          {doc.is_verified ? "Verified" : "Pending"}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant group-hover/file:text-primary text-lg">
                          visibility
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Dashboard;
