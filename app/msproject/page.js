'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Building2, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MSProjectGenerator() {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [company, setCompany] = useState('');
  const [manager, setManager] = useState('');
  const [wbsInput, setWbsInput] = useState('');
  const [inputFormat, setInputFormat] = useState('text'); // 'text' or 'json'
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample WBS templates
  const sampleTextWBS = `1. Planning Phase (10 days)
  1.1. Requirements Gathering (5 days)
  1.2. System Design (5 days)
2. Development Phase (20 days)
  2.1. Frontend Development (10 days)
  2.2. Backend Development (10 days)
3. Testing Phase (5 days)
  3.1. Unit Testing (2 days)
  3.2. Integration Testing (3 days)
4. Deployment (2 days)`;

  const sampleJsonWBS = JSON.stringify([
    {
      name: 'Planning Phase',
      duration: 10,
      children: [
        { name: 'Requirements Gathering', duration: 5 },
        { name: 'System Design', duration: 5 }
      ]
    },
    {
      name: 'Development Phase',
      duration: 20,
      children: [
        { name: 'Frontend Development', duration: 10 },
        { name: 'Backend Development', duration: 10 }
      ]
    },
    {
      name: 'Testing Phase',
      duration: 5,
      children: [
        { name: 'Unit Testing', duration: 2 },
        { name: 'Integration Testing', duration: 3 }
      ]
    },
    {
      name: 'Deployment',
      duration: 2
    }
  ], null, 2);

  const handleLoadSample = () => {
    setProjectName('Sample Project');
    setCompany('ACME Corp');
    setManager('John Doe');
    setWbsInput(inputFormat === 'text' ? sampleTextWBS : sampleJsonWBS);
    toast.success('Sample WBS loaded!');
  };

  const handleGenerate = async () => {
    // Validate inputs
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!wbsInput.trim()) {
      toast.error('Please enter WBS data');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare request body
      const requestBody = {
        projectData: {
          name: projectName,
          startDate: startDate,
          company: company,
          manager: manager
        }
      };

      // Add WBS data based on format
      if (inputFormat === 'text') {
        requestBody.wbsText = wbsInput;
      } else {
        try {
          requestBody.tasks = JSON.parse(wbsInput);
        } catch (e) {
          toast.error('Invalid JSON format. Please check your WBS data.');
          setIsGenerating(false);
          return;
        }
      }

      // Make API request
      const response = await fetch('/api/msproject/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate MS Project file');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('MS Project file generated successfully!');
    } catch (error) {
      console.error('Error generating MS Project file:', error);
      toast.error(error.message || 'Failed to generate MS Project file');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            MS Project Generator
          </h1>
          <p className="text-xl text-gray-300">
            Convert your Work Breakdown Structure (WBS) to MS Project XML format
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Project Info */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Project Information
              </h2>

              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional"
                  />
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Project Manager
                  </label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                How to Use
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Fill in project information on the left</li>
                <li>• Enter your WBS data in text or JSON format</li>
                <li>• Text format: Use indentation and (X days) for duration</li>
                <li>• Click "Load Sample" to see an example</li>
                <li>• Click "Generate MS Project File" to download</li>
                <li>• Open the .xml file in Microsoft Project</li>
              </ul>
            </div>
          </div>

          {/* Right Column - WBS Input */}
          <div className="space-y-6">
            {/* WBS Input Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  WBS Data
                </h2>
                
                {/* Format Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputFormat('text')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      inputFormat === 'text'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setInputFormat('json')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      inputFormat === 'json'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {/* WBS Textarea */}
              <textarea
                value={wbsInput}
                onChange={(e) => setWbsInput(e.target.value)}
                className="w-full h-96 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder={inputFormat === 'text' 
                  ? "Enter WBS in text format:\n1. Task 1 (5 days)\n  1.1. Subtask (2 days)\n2. Task 2 (3 days)"
                  : "Enter WBS in JSON format:\n[\n  {\n    \"name\": \"Task 1\",\n    \"duration\": 5,\n    \"children\": [...]\n  }\n]"
                }
              />

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleLoadSample}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Generate MS Project File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Generated files are compatible with Microsoft Project 2003 and later versions</p>
          <p className="mt-2">The XML file can be opened directly in MS Project or imported into other project management tools</p>
        </div>
      </div>
    </div>
  );
}
