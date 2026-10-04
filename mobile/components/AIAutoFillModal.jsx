import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon, BoltIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const AIAutoFillModal = ({ isOpen, onClose, onApply }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedData(null);

    try {
      const response = await fetch('/api/ai/listing-draft', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to generate a listing draft.');
      }

      setGeneratedData(data.draft);
    } catch (error) {
      window.alert(error.message || 'Unable to generate a listing draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedData) {
      onApply(generatedData);
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setPrompt("");
        setGeneratedData(null);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-black tracking-tight">AI Auto-Fill</h3>
                <p className="text-xs font-medium text-white/80 uppercase tracking-widest">AI-powered draft</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <p className="text-gray-600 font-medium mb-4">
              Describe what you are offering in a single sentence, and our AI will automatically write your title, description, and extract pricing and location data!
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I am a photographer in Cape Town charging R1500 per session."
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-[10px] focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none mb-6 text-gray-800 font-medium placeholder-gray-400"
              rows={3}
            />

            {!generatedData && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:hover:bg-gray-900 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is thinking...
                  </>
                ) : (
                  <>
                    <BoltIcon className="w-6 h-6" />
                    Generate Listing
                  </>
                )}
              </button>
            )}

            {/* Generated Preview */}
            <AnimatePresence>
              {generatedData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-green-50/50 border border-green-100 rounded-2xl p-6"
                >
                  <h4 className="text-sm font-black text-green-800 uppercase tracking-widest mb-4">Generated Preview</h4>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Title</span>
                      <p className="text-gray-900 font-semibold">{generatedData.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Address</span>
                      <p className="text-gray-900 font-medium">{generatedData.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Price</span>
                      <p className="text-gray-900 font-medium">R{generatedData.regularPrice || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Description</span>
                      <p className="text-gray-600 text-sm line-clamp-2">{generatedData.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleApply}
                    className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                  >
                    <CheckBadgeIcon className="w-6 h-6" />
                    Apply to Form
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

AIAutoFillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

export default AIAutoFillModal;
