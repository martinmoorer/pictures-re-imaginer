
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { MagicWandIcon, PhotoIcon } from './components/Icons';
import { describeImage, generateImage } from './services/geminiService';

export default function App() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File | null) => {
    setOriginalImageFile(file);
    setGeneratedImage(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!originalImageFile || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await fileToBase64(originalImageFile);
      const image_data_for_api = base64Image.split(',')[1];
      
      const descriptionPrompt = `Describe this image in vivid detail for an AI image generator. Focus on the subject, setting, composition, colors, lighting, and overall mood. Be descriptive and evocative.`;
      
      const description = await describeImage(image_data_for_api, descriptionPrompt);

      const finalGenerationPrompt = `A stunning, high-resolution photograph based on this description: "${description}". Now, apply this creative direction: "${prompt}". Combine them to create a new, masterpiece image.`;
      
      const newImageBase64 = await generateImage(finalGenerationPrompt);
      setGeneratedImage(`data:image/png;base64,${newImageBase64}`);

    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700 h-fit">
            <h2 className="text-2xl font-bold text-white mb-2">1. Upload Your Photo</h2>
            <p className="text-gray-400 mb-6">Start by selecting an image you want to re-imagine.</p>
            <ImageUploader onImageUpload={handleImageUpload} />

            <h2 className="text-2xl font-bold text-white mt-8 mb-2">2. Describe Your Vision</h2>
            <p className="text-gray-400 mb-6">Tell the AI what changes you'd like to see. Be creative!</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Make it look like a vintage polaroid photo', 'Turn this into a cyberpunk city scene', 'Add a dramatic, stormy sky'"
              className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
            />
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !originalImageFile || !prompt}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader /> : <MagicWandIcon />}
              <span className="ml-2">{isLoading ? 'Generating...' : 'Apply Magic'}</span>
            </button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          {/* Right Panel: Output */}
          <div className="lg:col-span-8 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700 min-h-[600px] flex flex-col justify-center items-center">
             {isLoading ? (
               <div className="text-center">
                 <Loader size="lg" />
                 <p className="mt-4 text-lg text-gray-400 animate-pulse">The AI is working its magic... this may take a moment.</p>
               </div>
             ) : generatedImage ? (
                <div className="w-full animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-4 text-center">Your Magical Creation!</h2>
                    <img src={generatedImage} alt="Generated by AI" className="rounded-lg shadow-2xl w-full max-w-2xl mx-auto object-contain" />
                </div>
             ) : (
               <div className="text-center text-gray-500">
                 <PhotoIcon className="w-24 h-24 mx-auto" />
                 <h3 className="mt-4 text-2xl font-semibold">Your generated image will appear here</h3>
                 <p className="mt-2 max-w-md mx-auto">Upload a photo and provide a prompt to get started.</p>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
