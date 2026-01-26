import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaUpload,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaFingerprint,
  FaShieldAlt,
  FaLock,
  FaUserCheck,
  FaQrcode,
  FaChartLine,
  FaStar,
  FaClock,
  FaArrowRight,
  FaCloudUpload,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaLinkedin,
  FaGlobe,
  FaRocket,
  FaCrown,
  FaKey,
  FaMobileAlt,
  FaDesktop,
  FaCameraRetro,
  FaVideo,
  FaSync,
  FaDatabase,
  FaClipboardCheck,
  FaCertificate,
  FaUserShield,
  FaShieldCheck,
  FaAward,
  FaGem,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Smartphone, 
  Mail, 
  CreditCard,
  Shield,
  User,
  QrCode,
  BarChart3,
  Clock,
  ArrowRight,
  Cloud,
  Eye,
  EyeOff,
  Globe,
  Zap,
  Crown,
  Key,
  Monitor,
  Video,
  RefreshCw,
  Database,
  ClipboardCheck,
  Award,
  Gem,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function Verification() {
  const [activeStep, setActiveStep] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState('face');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [faceMatchScore, setFaceMatchScore] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState(1);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const verificationSteps = [
    { id: 0, title: 'Identity Verification', icon: <FaUserCheck />, status: 'completed' },
    { id: 1, title: 'Document Upload', icon: <FaIdCard />, status: 'active' },
    { id: 2, title: 'Face Recognition', icon: <FaFingerprint />, status: 'pending' },
    { id: 3, title: 'Phone Verification', icon: <FaPhone />, status: 'pending' },
    { id: 4, title: 'Final Review', icon: <FaShieldCheck />, status: 'pending' }
  ];
  
  const verificationMethods = [
    {
      id: 'face',
      title: 'Face Recognition',
      icon: <FaFingerprint />,
      description: 'Scan your face using your camera',
      time: '2 minutes',
      security: 'High',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'document',
      title: 'Document Scan',
      icon: <FaIdCard />,
      description: 'Upload government-issued ID',
      time: '5 minutes',
      security: 'Very High',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      icon: <FaPhone />,
      description: 'Verify via SMS code',
      time: '1 minute',
      security: 'Medium',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'video',
      title: 'Video Verification',
      icon: <FaVideo />,
      description: 'Record a short verification video',
      time: '3 minutes',
      security: 'Highest',
      color: 'from-red-500 to-orange-500'
    }
  ];
  
  const verificationBenefits = [
    { icon: <FaShieldAlt />, title: 'Enhanced Security', description: 'Protect your account from unauthorized access' },
    { icon: <FaCrown />, title: 'Premium Features', description: 'Access exclusive features and higher limits' },
    { icon: <FaChartLine />, title: 'Trust Score', description: 'Build credibility with other users' },
    { icon: <FaGlobe />, title: 'Global Access', description: 'Use our platform anywhere in the world' }
  ];
  
  const documentTypes = [
    { type: 'passport', name: 'Passport', icon: <FaIdCard />, accepted: true },
    { type: 'driver', name: "Driver's License", icon: <FaIdCard />, accepted: true },
    { type: 'national', name: 'National ID', icon: <FaIdCard />, accepted: true },
    { type: 'residence', name: 'Residence Permit', icon: <FaIdCard />, accepted: true }
  ];
  
  // Simulate verification progress
  useEffect(() => {
    if (verificationStatus === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setVerificationStatus('completed');
            setVerificationLevel(prev => Math.min(5, prev + 1));
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [verificationStatus]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera access denied. Please allow camera access to continue.");
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };
  
  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    
    setVerificationStatus('processing');
    stopCamera();
    
    // Simulate face matching
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 70;
      setFaceMatchScore(score);
      if (score > 80) {
        setVerificationStatus('completed');
      } else {
        setVerificationStatus('failed');
      }
    }, 2000);
  };
  
  const handleFileUpload = (files) => {
    const newDocuments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded: new Date().toISOString(),
      status: 'processing'
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setVerificationStatus('processing');
    
    // Simulate document processing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => ({ ...doc, status: 'verified' })));
      setVerificationStatus('completed');
      setVerificationLevel(prev => Math.min(5, prev + 1));
    }, 3000);
  };
  
  const VerificationCard = ({ title, description, icon, status, onClick, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
        status === 'completed'
          ? 'border-green-500 bg-green-50'
          : status === 'active'
          ? `border-${color.split('-')[1]}-500 bg-gradient-to-br ${color}/20`
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          status === 'completed' ? 'bg-green-100 text-green-600' :
          status === 'active' ? 'bg-white text-gray-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {icon}
        </div>
        {status === 'completed' && (
          <FaCheckCircle className="w-6 h-6 text-green-500" />
        )}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {status === 'active' && (
        <div className="mt-4 flex items-center text-sm text-blue-600">
          <span>Active</span>
          <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </motion.div>
  );
  
  const ProgressBar = ({ progress, color = 'blue' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-2.5 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
      />
    </div>
  );
  
  const SecurityBadge = ({ level }) => {
    const badges = [
      { level: 1, label: 'Basic', color: 'gray', icon: <FaShieldAlt /> },
      { level: 2, label: 'Verified', color: 'blue', icon: <FaShieldCheck /> },
      { level: 3, label: 'Trusted', color: 'green', icon: <FaUserShield /> },
      { level: 4, label: 'Premium', color: 'purple', icon: <FaCrown /> },
      { level: 5, label: 'Elite', color: 'yellow', icon: <FaGem /> }
    ];
    
    const badge = badges[level - 1] || badges[0];
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${badge.color}-100 text-${badge.color}-700`}>
        {badge.icon}
        <span className="font-bold">{badge.label} Level</span>
      </div>
    );
  };
  
  const renderVerificationContent = () => {
    switch (verificationMethod) {
      case 'face':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Face Recognition</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We'll take a quick photo to verify your identity. Make sure you're in a well-lit area and looking directly at the camera.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Instructions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Ensure good lighting on your face</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Remove glasses and hats</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Look directly at the camera</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Keep a neutral expression</span>
                    </li>
                  </ul>
                </div>
                
                {verificationStatus === 'completed' && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FaCheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Face Verified!</h4>
                        <p className="text-green-700">Match score: {faceMatchScore}%</p>
                      </div>
                    </div>
                    <ProgressBar progress={faceMatchScore} color="green" />
                  </div>
                )}
                
                {verificationStatus === 'failed' && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FaTimesCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">Verification Failed</h4>
                        <p className="text-red-700">Match score: {faceMatchScore}% (Minimum 80% required)</p>
                      </div>
                    </div>
                    <button
                      onClick={startCamera}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
                  {cameraActive ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/30 rounded-2xl"></div>
                      </div>
                      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                        <FaCamera className="w-16 h-16 text-white/50" />
                      </div>
                      <p className="text-center text-white/80">
                        {verificationStatus === 'pending' 
                          ? 'Click Start Camera to begin face verification'
                          : 'Camera preview will appear here'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold"
                    >
                      <FaCamera />
                      Start Camera
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={captureFace}
                        className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold"
                      >
                        <FaCamera />
                        Capture & Verify
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
                      >
                        <FaTimesCircle />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'document':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Verification</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload a clear photo of your government-issued ID. All documents are encrypted and stored securely.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Accepted Documents</h4>
                  <div className="space-y-3">
                    {documentTypes.map((doc) => (
                      <div key={doc.type} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {doc.icon}
                          </div>
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        {doc.accepted && (
                          <FaCheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Important Notes</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Document must be valid and not expired</li>
                        <li>• All four corners must be visible</li>
                        <li>• Text must be clear and readable</li>
                        <li>• File size must be under 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                    <FaCloudUpload className="w-12 h-12 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Upload Document</h4>
                  <p className="text-gray-600 mb-4">Drag & drop or click to browse</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, PDF up to 10MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
                
                {documents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">Uploaded Documents</h4>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              doc.status === 'verified' ? 'bg-green-100 text-green-600' :
                              doc.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <FaIdCard className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {Math.round(doc.size / 1024)} KB • {new Date(doc.uploaded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.status === 'processing' && (
                              <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {doc.status === 'verified' && (
                              <FaCheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {verificationStatus === 'processing' && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing document...</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} color="blue" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
              <FaShieldAlt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a Verification Method</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose one of the verification methods above to continue with the verification process.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <FaShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Identity Verification
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Complete your verification to unlock premium features and enhance your account security. 
            This process helps us ensure a safe environment for all users.
          </p>
        </div>
        
        {/* Verification Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Progress</h2>
              <p className="text-gray-600">Complete all steps to reach Elite verification level</p>
            </div>
            <SecurityBadge level={verificationLevel} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {verificationSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VerificationCard
                  title={step.title}
                  description={`Step ${step.id + 1}`}
                  icon={step.icon}
                  status={step.status}
                  onClick={() => setActiveStep(step.id)}
                  color={step.id === activeStep ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600'}
                />
              </motion.div>
            ))}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{Math.round((activeStep + 1) / verificationSteps.length * 100)}%</span>
            </div>
            <ProgressBar progress={((activeStep + 1) / verificationSteps.length) * 100} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Verification Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              {/* Method Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Verification Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {verificationMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVerificationMethod(method.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        verificationMethod === method.id
                          ? `border-${method.color.split('-')[1]}-500 bg-gradient-to-br ${method.color}/10`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-3 rounded-lg mb-3 inline-flex ${
                        verificationMethod === method.id
                          ? 'bg-white shadow'
                          : 'bg-gray-100'
                      }`}>
                        {method.icon}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{method.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{method.time}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          method.security === 'Highest' ? 'bg-red-100 text-red-700' :
                          method.security === 'Very High' ? 'bg-purple-100 text-purple-700' :
                          method.security === 'High' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {method.security} Security
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Verification Content */}
              <div className="mt-12">
                {renderVerificationContent()}
              </div>
              
              {/* Verification Tips */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaLightbulb className="w-5 h-5 text-amber-500" />
                  Verification Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Use Good Lighting</div>
                    <p className="text-sm text-gray-600">Natural light works best for face verification</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Clear Documents</div>
                    <p className="text-sm text-gray-600">Ensure all text is readable in photos</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Stay Patient</div>
                    <p className="text-sm text-gray-600">Processing may take a few minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Benefits */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-6">Verification Benefits</h3>
              <div className="space-y-4">
                {verificationBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Security Level */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
              <h3 className="font-bold mb-6">Security Level</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationLevel >= level
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                          : 'bg-gray-700'
                      }`}>
                        {level === 5 ? <FaGem /> :
                         level === 4 ? <FaCrown /> :
                         level === 3 ? <FaUserShield /> :
                         level === 2 ? <FaShieldCheck /> :
                         <FaShieldAlt />}
                      </div>
                      <span className={verificationLevel >= level ? 'font-bold' : 'text-gray-400'}>
                        Level {level}
                      </span>
                    </div>
                    {verificationLevel >= level && (
                      <FaCheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Current Protection</p>
                  <p className="text-2xl font-bold">
                    {verificationLevel === 5 ? 'Maximum' :
                     verificationLevel === 4 ? 'Advanced' :
                     verificationLevel === 3 ? 'Enhanced' :
                     verificationLevel === 2 ? 'Standard' :
                     'Basic'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow">
                      <FaPhone className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">Phone Verification</span>
                  </div>
                  <FaArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow">
                      <FaEnvelope className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium">Email Verification</span>
                  </div>
                  <FaArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow">
                      <FaQrcode className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium">2FA Setup</span>
                  </div>
                  <FaArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Support Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200">
              <div className="flex items-start gap-3 mb-4">
                <FaInfoCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <h4 className="font-bold text-gray-900">Need Help?</h4>
                  <p className="text-sm text-gray-600 mt-1">Our support team is available 24/7</p>
                </div>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
        
        {/* Verification Status Banner */}
        <AnimatePresence>
          {verificationStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <FaCheckCircle className="w-8 h-8" />
                <div>
                  <h4 className="font-bold text-lg">Verification Complete!</h4>
                  <p className="text-green-100 text-sm">Your identity has been successfully verified</p>
                </div>
              </div>
              <p className="text-sm mb-4">
                You now have access to premium features and enhanced security.
              </p>
              <button className="w-full py-2 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors">
                Continue to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Add CSS animations
const styles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Mock Lucide components
const FaLightbulb = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.93 4.93a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM18.36 5.64a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 8a4 4 0 110 8 4 4 0 010-8z" />
  </svg>
);