import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserSuccess } from '../redux/user/userSlice';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { app } from '../firebase';
import { 
  ShieldCheckIcon, 
  UserCircleIcon, 
  CameraIcon, 
  IdentificationIcon, 
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  Camera, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Scan,
  Zap,
  Award,
  Lock
} from 'lucide-react';

export default function Verification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [contactInfo, setContactInfo] = useState({ type: 'phone', value: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const videoRef = useRef(null);

  const [kycStep, setKycStep] = useState(1);
  const [idUrl, setIdUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const fileRef = useRef(null);

  // Verification Protocols
  const PROTOCOLS = [
    { id: 'kyc', label: 'LIVE IDENTITY (KYC)', icon: <IdentificationIcon className="w-6 h-6" />, color: 'bg-indigo-500', description: 'Gov ID + Live Selfie Verification' },
    { id: 'phone', label: 'SIGNAL VERIFY', icon: <PhoneIcon className="w-6 h-6" />, color: 'bg-emerald-500', description: 'End-to-end encrypted signal verification' },
  ];

  const uploadKycFile = async (fileOrBase64, folder, setUrlState) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "_upload";
    const storageRef = ref(storage, `kyc/${folder}/${fileName}`);
    setIsProcessing(true);
    setError(null);
    
    let uploadTask;

    if (typeof fileOrBase64 === 'string') {
        // Convert dataUrl to Blob for resumable upload
        const fetchResponse = await fetch(fileOrBase64);
        const blob = await fetchResponse.blob();
        uploadTask = uploadBytesResumable(storageRef, blob);
    } else {
        uploadTask = uploadBytesResumable(storageRef, fileOrBase64);
    }

    uploadTask.on('state_changed', 
        (snapshot) => { setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
        (err) => { 
            console.error("Upload error:", err);
            setError(err.code === 'storage/unauthorized' ? 'Neural security denied access. Contact core support.' : 'Upload failed'); 
            setIsProcessing(false); 
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setUrlState(downloadURL);
                if (folder === 'idDocuments') {
                   setIdUrl(downloadURL);
                   setIsProcessing(false);
                   setProgress(0);
                   setKycStep(2);
                } else {
                   setSelfieUrl(downloadURL);
                   setIsProcessing(false);
                   setProgress(0);
                   submitKycFinal(idUrl, downloadURL);
                }
            });
        }
    );
  };

  const handleIdChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadKycFile(file, 'idDocuments', setIdUrl);
    }
  };

  const handleCaptureSelfie = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        uploadKycFile(dataUrl, 'selfies', setSelfieUrl);
    }
  };

  const submitKycFinal = async (idDocumentUrl, liveSelfieUrl) => {
     try {
       setIsProcessing(true);
       const res = await fetch('/api/verification/submit-kyc', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ idDocumentUrl, liveSelfieUrl })
       });
       const data = await res.json();
       if (data.success === false) { setError(data.message); return; }
       
       const updatedUser = { ...currentUser, isVerified: true, kycStatus: 'pending' };
       dispatch(updateUserSuccess(updatedUser));
       setStep(3); // success screen
     } catch (err) {
       setError("Validation Failed");
     } finally { setIsProcessing(false); }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/profile');
  };

  const startVerification = (methodId) => {
    setMethod(methodId);
    setStep(2);
    setError(null);
  };

  const handleSendOTP = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const res = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contactInfo.type, value: contactInfo.value }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      setOtpSent(true);
    } catch (err) {
      setError('Neural connection failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const res = await fetch('/api/verification/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode.join('') }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      
      // Simulate the UI progress for cinematic effect
      runSimulation();
    } catch (err) {
      setError('Signal synchronization failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runSimulation = () => {
    setIsProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
             setIsProcessing(false);
             // When success, update user in Redux
             const updatedUser = { ...currentUser, isVerified: true };
             dispatch(updateUserSuccess(updatedUser));
             setStep(3); 
          }, 800);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access failed", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-32">
      {/* Background Cinematic Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Header Breadcrumb */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-3 text-gray-400 hover:text-rose-600 transition-colors mb-12"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-rose-50 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Abort / Return</span>
        </button>

        <AnimatePresence mode="wait">
          {/* STEP 1: Method Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em]">Initialization Phase</span>
                </div>
                <h1 className="text-6xl font-black text-gray-950 tracking-tighter italic">
                  NEURAL <br/>
                  <span className="text-gray-300">IDENTITY</span>
                </h1>
                <p className="max-w-xl text-gray-500 font-medium leading-relaxed">
                  Establish an immutable connection between your physical presence and the loopOut network. 
                  Choose a deployment protocol to securely verify your identity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROTOCOLS.map((protocol) => (
                  <button
                    key={protocol.id}
                    onClick={() => startVerification(protocol.id)}
                    className="flex flex-col items-start gap-8 p-8 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-2xl rounded-[2.5rem] transition-all"
                  >
                    <div className={`p-4 ${protocol.color} text-white rounded-2xl shadow-xl transition-transform hover:rotate-12`}>
                      {protocol.icon}
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">{protocol.label}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">{protocol.description}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300 hover:text-rose-600 transition-colors" />
                  </button>
                ))}
              </div>

              {/* Verified Benefits */}
              <div className="pt-12 border-t border-gray-100 flex flex-wrap gap-12">
                 {[
                   { label: "Elite Badge", desc: "Gain the Masterpiece Elite status mark" },
                   { label: "Priority Signals", desc: "Faster response times on all requests" },
                   { label: "Immutable Trust", desc: "Highest verification score in-network" }
                 ].map((ben, i) => (
                   <div key={i} className="flex-1 min-w-[200px] flex items-start gap-4">
                      <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center flex-shrink-0">
                         <CheckCircle2 size={14} className="text-rose-600" />
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-widest">{ben.label}</h4>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{ben.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Active Verification */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-12"
            >
              {method === 'kyc' && (
                <div className="w-full max-w-2xl space-y-12">
                   {kycStep === 1 && (
                     <div className="w-full text-center space-y-12">
                       <div className="space-y-4">
                          <h2 className="text-4xl font-black text-gray-950 tracking-tighter italic">STEP 1: IDENTITY DOCUMENT</h2>
                          <p className="text-gray-500 font-medium">Please upload a clear image of your Passport, National ID, or Driver's License.</p>
                       </div>
                       
                       <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleIdChange} />
                       
                       <div className="relative aspect-[1.6/1] bg-gray-50 border-4 border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center justify-center p-12 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer"
                        onClick={() => fileRef.current.click()}
                       >
                           {isProcessing ? (
                             <div className="flex flex-col items-center gap-4">
                                <Loader2 size={40} className="text-indigo-500 animate-spin" />
                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500">{Math.round(progress)}% UPLOADING...</p>
                                <div className="w-48 h-2 bg-indigo-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: `${progress}%`}} />
                                </div>
                             </div>
                           ) : (
                             <>
                               <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                  <IdentificationIcon className="w-10 h-10 text-indigo-500" />
                               </div>
                               <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-indigo-600">Select Document File</p>
                             </>
                           )}
                       </div>
                     </div>
                   )}

                   {kycStep === 2 && (
                     <div className="w-full text-center space-y-12">
                       <div className="space-y-4">
                          <div className="px-5 py-2 bg-rose-600 text-white rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                             <Scan size={14} /> BIOMETRIC CAPTURE
                          </div>
                          <h2 className="text-4xl font-black text-gray-950 tracking-tighter">STEP 2: LIVE SELFIE</h2>
                       </div>
    
                       <div className="relative overflow-hidden rounded-[3rem] bg-gray-950 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.3)] aspect-[4/3] flex items-center justify-center">
                         {cameraActive ? (
                           <>
                             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-90" />
                             <div className="absolute inset-0 border-[20px] border-black/40" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-rose-500/80 rounded-[4rem] flex flex-col items-center shadow-xl">
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-500/40 animate-scan" />
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-500 uppercase tracking-widest whitespace-nowrap bg-black/50 px-3 py-1 rounded-full">Center face here</div>
                             </div>
                           </>
                         ) : (
                           <button 
                             onClick={toggleCamera}
                             className="flex flex-col items-center gap-4 text-white/40 hover:text-white transition-all"
                           >
                             <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center hover:border-rose-500 hover:bg-rose-500/10 active:scale-90 duration-500">
                               <Camera size={32} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em]">INITIATE CAMERA</span>
                           </button>
                         )}
                          
                         {isProcessing && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center space-y-8">
                               <div className="relative">
                                  <Loader2 size={64} className="text-rose-500 animate-spin" />
                               </div>
                               <div className="space-y-2">
                                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Secure Nodes</p>
                                  <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                  </div>
                               </div>
                            </div>
                         )}
                       </div>
    
                       {!isProcessing && cameraActive && (
                         <div className="flex justify-center gap-4">
                            <button 
                              onClick={handleCaptureSelfie}
                              className="px-12 py-5 bg-gray-950 text-white hover:bg-black rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                            >
                              Verify Selfie
                            </button>
                         </div>
                       )}
                     </div>
                   )}
                   {error && <p className="text-center text-rose-500 text-[10px] font-black uppercase tracking-widest mt-6 bg-rose-50 py-2 rounded-full">{error}</p>}
                </div>
              )}

              {method === 'phone' && (
                <div className="w-full max-w-xl mx-auto space-y-12">
                   <div className="text-center space-y-4">
                      <div className="px-5 py-2 bg-emerald-600 text-white rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                         <Zap size={14} /> SECURITY SIGNAL ACTIVE
                      </div>
                      <h2 className="text-4xl font-black text-gray-950 tracking-tighter">SIGNAL VERIFY</h2>
                      <p className="text-gray-500 font-medium">Link your secure communication channel to the loopOut neural network.</p>
                   </div>

                   <AnimatePresence mode="wait">
                     {!otpSent ? (
                       <motion.div
                         key="contact-input"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="space-y-8"
                       >
                         {/* Toggle Type */}
                         <div className="flex p-1 bg-gray-100 rounded-full">
                           {['phone', 'email'].map((type) => (
                             <button
                               key={type}
                               onClick={() => setContactInfo({ ...contactInfo, type })}
                               className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                 contactInfo.type === type ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400'
                               }`}
                             >
                               {type}
                             </button>
                           ))}
                         </div>

                         <div className="relative">
                            <input 
                              type={contactInfo.type === 'phone' ? 'tel' : 'email'}
                              placeholder={contactInfo.type === 'phone' ? '+27 000 000 0000' : 'user@neural.com'}
                              className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-300"
                              value={contactInfo.value}
                              onChange={(e) => setContactInfo({ ...contactInfo, value: e.target.value })}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-emerald-50 rounded-xl">
                               {contactInfo.type === 'phone' ? <PhoneIcon className="w-6 h-6 text-emerald-600" /> : <EnvelopeIcon className="w-6 h-6 text-emerald-600" />}
                            </div>
                         </div>

                         <button 
                           onClick={handleSendOTP}
                           className="w-full py-6 bg-gray-950 text-white hover:bg-black rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                           disabled={!contactInfo.value || isProcessing}
                         >
                           {isProcessing ? 'Transmitting...' : 'Transmit Protocol Signal'}
                         </button>
                         {error && <p className="text-center text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 py-2 rounded-full">{error}</p>}
                       </motion.div>
                     ) : (
                       <motion.div
                         key="otp-input"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="space-y-8"
                       >
                         <div className="text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Protocol Code Sent To</p>
                            <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{contactInfo.value}</p>
                         </div>

                         <div className="flex gap-3 justify-center">
                           {otpCode.map((digit, i) => (
                             <input
                               key={i}
                               type="text"
                               maxLength={1}
                               className="w-12 h-16 bg-gray-50 border border-gray-100 rounded-2xl text-center text-xl font-black text-gray-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                               value={digit}
                               onChange={(e) => {
                                 const newCode = [...otpCode];
                                 newCode[i] = e.target.value;
                                 setOtpCode(newCode);
                                 // Auto focus next
                                 if (e.target.value && i < 5) {
                                   const next = e.target.parentElement.children[i + 1];
                                   if (next) next.focus();
                                 }
                               }}
                             />
                           ))}
                         </div>

                         <div className="space-y-4">
                            <button 
                              onClick={handleVerifyOTP}
                              className="w-full py-6 bg-emerald-600 text-white hover:bg-emerald-700 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95"
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Synchronizing...' : 'Verify Neural Signal'}
                            </button>
                            {error && <p className="text-center text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 py-2 rounded-full">{error}</p>}
                            <button 
                              onClick={() => { setOtpSent(false); setError(null); }}
                              className="w-full py-4 text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Edit Contact Information
                            </button>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Success Result */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="w-40 h-40 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]"
                >
                  <CheckBadgeIcon className="w-20 h-20" />
                </motion.div>
                <div className="absolute inset-0 bg-emerald-500 blur-[80px] -z-10 opacity-30" />
              </div>

              <div className="space-y-6 mb-12">
                 <h2 className="text-6xl font-black text-gray-950 tracking-tighter italic">IDENTITY <br/> ESTABLISHED</h2>
                 <p className="text-gray-500 max-w-md mx-auto font-medium">
                   Your neural signal has been successfully hard-coded into the loopOut verification chain. You now hold ELITE level status.
                 </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 max-w-md w-full mb-12 flex items-center gap-6">
                 <div className="relative">
                   <img src={currentUser?.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 p-0.5" />
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center">
                      <Award size={10} className="text-white" />
                   </div>
                 </div>
                 <div className="text-left flex-1 min-w-0">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">ELITE VERIFIED</p>
                    <p className="text-lg font-bold text-gray-900 truncate">{currentUser?.username}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trust Score</p>
                    <p className="text-xl font-black italic tracking-tighter text-gray-950">99.8%</p>
                 </div>
              </div>

              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-4 px-12 py-6 bg-gray-950 text-white hover:bg-black rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
              >
                Sync Final Core
                <ChevronRightIcon className="w-5 h-5 hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}} />
    </div>
  );
}
