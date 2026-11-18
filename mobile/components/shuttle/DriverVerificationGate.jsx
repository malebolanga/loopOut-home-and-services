import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, ShieldCheck, Upload, UserRound, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import { uploadFiles } from '../../services/upload.service';

const DOCUMENTS = [
  { key: 'idDocumentUrl', title: 'Government ID or passport', accept: 'image/*,.pdf', Icon: FileText },
  { key: 'facePhotoUrl', title: 'Clear face photo', accept: 'image/*', Icon: UserRound },
  { key: 'licenceDocumentUrl', title: 'Driving licence', accept: 'image/*,.pdf', Icon: ShieldCheck },
];

const DriverVerificationGate = ({ isOpen, onClose, onApproved }) => {
  const [status, setStatus] = useState('loading');
  const [documents, setDocuments] = useState({ idDocumentUrl: '', facePhotoUrl: '', licenceDocumentUrl: '' });
  const [uploadingKey, setUploadingKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    axios.get(resolveApiUrl('/api/verification/driver-status'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }).then(({ data }) => {
      if (!active) return;
      setStatus(data.status || 'unverified');
      setDocuments(data.documents || { idDocumentUrl: '', facePhotoUrl: '', licenceDocumentUrl: '' });
      setMessage(data.reviewNote || '');
      setError('');
    }).catch((requestError) => {
      if (!active) return;
      setStatus('error');
      setError(requestError.response?.data?.message || 'Could not load your driver document status. Please try again.');
    });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && status === 'verified' && onApproved) onApproved(documents);
  }, [isOpen, status, onApproved, documents]);

  if (!isOpen || status === 'verified') return null;

  const uploadDocument = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    try {
      const [url] = await uploadFiles([file]);
      if (!url) throw new Error('The upload did not return a document link.');
      setDocuments((current) => ({ ...current, [key]: url }));
    } catch (uploadError) {
      setError(uploadError.message || 'Could not upload this document. Please try again.');
    } finally {
      setUploadingKey('');
    }
  };

  const submitDocuments = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!DOCUMENTS.every(({ key }) => documents[key])) {
      setError('Upload your ID, clear face photo, and driving licence before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(resolveApiUrl('/api/verification/driver-submit'), documents, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setStatus(data.status || 'pending');
      setMessage(data.message || 'Documents sent for administrator review.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your driver documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <section className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-900/80">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Driver application · Step 1 of 2</p>
            <h2 className="mt-1 text-lg font-black text-gray-950 dark:text-white">Verify your driver documents</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">We’ll review these before you can add a car or publish a shuttle.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close driver application" className="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
        </header>

        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading your application…</div>
        ) : (
          <form onSubmit={submitDocuments} className="space-y-4 p-5">
            {isPending ? (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
                <div><p className="text-sm font-bold">Documents awaiting review</p><p className="mt-1 text-xs">You can add a vehicle after an administrator reviews and approves all three documents.</p></div>
              </div>
            ) : isRejected ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100">
                <p className="text-sm font-bold">Please correct and resubmit</p>
                <p className="mt-1 text-xs">{message || 'Your previous application was not approved.'}</p>
              </div>
            ) : status === 'error' ? (
              <div role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>
            ) : null}

            {isRejected || status === 'unverified' ? (
              <>
                {DOCUMENTS.map(({ key, title, accept, Icon }) => (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-800">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"><Icon className="h-5 w-5" /></span>
                      <div className="min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white">{title} <span className="text-rose-500">*</span></p><p className="text-xs text-gray-500">{documents[key] ? 'Uploaded and ready' : 'Required for driver approval'}</p></div>
                    </div>
                    <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                      {uploadingKey === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {uploadingKey === key ? 'Uploading…' : documents[key] ? 'Replace' : 'Upload'}
                      <input type="file" accept={accept} disabled={Boolean(uploadingKey) || submitting} className="sr-only" onChange={(event) => { uploadDocument(key, event.target.files?.[0]); event.target.value = ''; }} />
                    </label>
                  </div>
                ))}
                <p className="text-xs leading-relaxed text-gray-500">An administrator will manually check that the ID is readable, the face photo matches the ID, and the driving licence is valid. Documents are private and are not used to create a car listing until approved.</p>
              </>
            ) : null}

            {error && status !== 'error' && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
            {message && status !== 'pending' && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}

            <footer className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">{isPending ? 'Close' : 'Cancel'}</button>
              {!isPending && status !== 'error' && (
                <button type="submit" disabled={submitting || Boolean(uploadingKey) || !DOCUMENTS.every(({ key }) => documents[key])} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {submitting ? 'Submitting…' : 'Submit for approval'}
                </button>
              )}
              {status === 'error' && <button type="button" onClick={() => setStatus('unverified')} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">Try again</button>}
            </footer>
          </form>
        )}
      </section>
    </div>
  );
};

export default DriverVerificationGate;
