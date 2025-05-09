
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Search } from 'lucide-react';

interface Keyword {
  id: string;
  text: string;
}

const QuickOptimizationForm = () => {
  const navigate = useNavigate();
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [content, setContent] = useState('');
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [showPrimaryKeywordSuggestions, setShowPrimaryKeywordSuggestions] = useState(false);
  const [showSecondaryKeywordSuggestions, setShowSecondaryKeywordSuggestions] = useState(false);
  
  const primaryKeywordSuggestions: Keyword[] = [
    { id: '1', text: 'best coffee beans 2024' },
    { id: '2', text: 'top ergonomic chairs' },
    { id: '3', text: 'learn javascript fast' },
  ];
  
  const secondaryKeywordSuggestions: Keyword[] = [
    { id: '1', text: 'dark roast coffee' },
    { id: '2', text: 'light roast coffee' },
    { id: '3', text: 'coffee grinding tips' },
    { id: '4', text: 'office chair for back pain' },
    { id: '5', text: 'standing desk benefits' },
    { id: '6', text: 'home office setup ideas' },
  ];
  
  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];
  
  const handleContentConfirm = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    setContentConfirmed(true);
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
  };
  
  const handlePrimaryKeywordSelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    setShowPrimaryKeywordSuggestions(false);
  };
  
  const handleSecondaryKeywordSelect = (keyword: string) => {
    const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k !== '');
    if (!keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword].join(', ');
      setSecondaryKeywords(newKeywords);
    }
  };
  
  const handleStartOptimization = () => {
    if (!contentConfirmed) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary Keyword Required",
        description: "Please add a primary keyword before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate loading
    toast({
      title: "Optimization Started",
      description: "Analyzing and optimizing your content...",
    });
    
    // Navigate to the results page after a delay
    setTimeout(() => {
      navigate('/seo-checker', { 
        state: { 
          content, 
          primaryKeyword, 
          secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(k => k !== '') 
        }
      });
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <h2 className="text-lg font-medium mb-4">1. Add your content</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="contentMethod" 
                  checked={contentMethod === 'text'} 
                  onChange={() => setContentMethod('text')} 
                  className="mr-2" 
                  disabled={contentConfirmed}
                />
                Add Text
              </label>
              
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="contentMethod" 
                  checked={contentMethod === 'link'} 
                  onChange={() => setContentMethod('link')} 
                  className="mr-2" 
                  disabled={contentConfirmed}
                />
                Add Link
              </label>
              
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="contentMethod" 
                  checked={contentMethod === 'file'} 
                  onChange={() => setContentMethod('file')} 
                  className="mr-2" 
                  disabled={contentConfirmed}
                />
                Upload File
              </label>
            </div>
            
            {contentMethod === 'text' && (
              <div className="quill-container h-64">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={modules} 
                  formats={formats}
                  readOnly={contentConfirmed}
                  placeholder="Paste your article content here..."
                  style={{ height: '200px' }}
                />
              </div>
            )}
            
            {contentMethod === 'link' && (
              <input 
                type="url" 
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter URL to your content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={contentConfirmed}
              />
            )}
            
            {contentMethod === 'file' && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setContent(e.target.files[0].name);
                    }
                  }}
                  disabled={contentConfirmed}
                />
                <label 
                  htmlFor="file-upload"
                  className={`cursor-pointer text-purple-600 hover:text-purple-800 ${contentConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Click to upload or drag and drop
                </label>
                {content && contentMethod === 'file' && <p className="mt-2 text-sm text-gray-500">{content}</p>}
              </div>
            )}
            
            {!contentConfirmed ? (
              <Button 
                variant="seoButton" 
                onClick={handleContentConfirm}
              >
                Confirm Content
              </Button>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckIcon className="mr-2" />
                <span>Content added/confirmed.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Keywords Section */}
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-medium">Primary Keyword:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-3 border border-gray-300 rounded-md"
                  placeholder="Enter your main keyword..."
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
                <button 
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                  onClick={() => setShowPrimaryKeywordSuggestions(!showPrimaryKeywordSuggestions)}
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>
              
              {showPrimaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested (select one):</div>
                  <div className="space-y-2">
                    {primaryKeywordSuggestions.map((keyword) => (
                      <label key={keyword.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="radio" 
                          name="primaryKeyword" 
                          className="mr-2"
                          checked={primaryKeyword === keyword.text}
                          onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                        />
                        {keyword.text}
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Regeneration note..."
                      />
                    </div>
                    <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Secondary Keywords (Optional):</label>
              <div className="flex gap-2">
                <textarea 
                  className="flex-1 p-3 border border-gray-300 rounded-md"
                  placeholder="Enter your secondary keywords, separated by commas..."
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  rows={2}
                />
                <button 
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                  onClick={() => setShowSecondaryKeywordSuggestions(!showSecondaryKeywordSuggestions)}
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>
              
              {showSecondaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested (select multiple):</div>
                  <div className="space-y-2">
                    {secondaryKeywordSuggestions.map((keyword) => (
                      <label key={keyword.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={secondaryKeywords.includes(keyword.text)}
                          onChange={() => handleSecondaryKeywordSelect(keyword.text)}
                        />
                        {keyword.text}
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Regeneration note..."
                      />
                    </div>
                    <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="seoButton" 
          className="w-full text-center py-3"
          onClick={handleStartOptimization}
        >
          Start Quick Optimization
        </Button>
      </div>
    </div>
  );
};

const CheckIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default QuickOptimizationForm;
