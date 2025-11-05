import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Quote, 
  Shield, 
  Edit3, 
  FileDown, 
  Layers,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ProjectTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const projectTemplates = [
    {
      id: 'ai-analysis',
      title: 'AI-Powered Analysis of a Current Topic',
      description: 'Find, analyze, and report on existing literature with AI assistance',
      difficulty: 'Intermediate',
      duration: '2-3 hours',
      icon: Brain,
      color: 'bg-blue-50 text-blue-600',
      steps: [
        {
          number: 1,
          title: 'Find Papers',
          description: 'Search for and select minimum 5 relevant, high-impact research papers',
          action: 'Go to Search',
          link: '/search',
          icon: Search
        },
        {
          number: 2,
          title: 'AI Analysis',
          description: 'Use AI chatbot to analyze 2 papers for core arguments and limitations',
          action: 'Start Analysis',
          link: '/analysis',
          icon: Brain
        },
        {
          number: 3,
          title: 'Generate Citations',
          description: 'Format citations in APA, MLA, or IEEE style for all 5 papers',
          action: 'Create Citations',
          link: '/citations',
          icon: Quote
        },
        {
          number: 4,
          title: 'Export Report',
          description: 'Create professional research report with AI insights and bibliography',
          action: 'Generate Report',
          link: '/reports',
          icon: FileDown
        }
      ],
      deliverables: [
        'Introduction to research topic',
        'Summary of core findings from 5 papers',
        'AI-generated insights and analysis section',
        'Complete formatted bibliography'
      ]
    },
    {
      id: 'paper-deep-dive',
      title: 'AI-Assisted Research Paper Deep Dive',
      description: 'Upload and deeply analyze a complex academic paper',
      difficulty: 'Advanced',
      duration: '1-2 hours',
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      steps: [
        {
          number: 1,
          title: 'Select Paper',
          description: 'Choose a research paper (PDF, max 10MB) from your technical field',
          action: 'Upload Paper',
          link: '/analysis',
          icon: FileText
        },
        {
          number: 2,
          title: 'AI Chat Analysis',
          description: 'Use AI to summarize introduction/conclusion and explain figures',
          action: 'Start Chat',
          link: '/analysis',
          icon: Brain
        },
        {
          number: 3,
          title: 'Extract Key Terms',
          description: 'Identify and define top 5 crucial technical terms',
          action: 'Extract Terms',
          link: '/analysis',
          icon: BookOpen
        },
        {
          number: 4,
          title: 'Critical Analysis',
          description: 'Ask custom questions about methodology and applications',
          action: 'Ask Questions',
          link: '/analysis',
          icon: Target
        }
      ],
      deliverables: [
        'Paper title and authors',
        'AI summary of introduction and conclusion',
        'Simplified explanation of chosen figure',
        'List of 5 key terms with definitions',
        'AI response to critical questions'
      ]
    },
    {
      id: 'literature-review',
      title: 'Multi-Tiered Literature Review',
      description: 'Build foundational literature set using three-tier access system',
      difficulty: 'Beginner',
      duration: '1-2 hours',
      icon: Layers,
      color: 'bg-purple-50 text-purple-600',
      steps: [
        {
          number: 1,
          title: 'Define Topic',
          description: 'Choose from Deep Learning, Quantum Computing, or Climate Change',
          action: 'Select Topic',
          link: '/search',
          icon: Target
        },
        {
          number: 2,
          title: 'Multi-Tier Search',
          description: 'Search across Open Access, Preprint, and Locked papers',
          action: 'Start Search',
          link: '/search',
          icon: Search
        },
        {
          number: 3,
          title: 'Source Selection',
          description: 'Select 5 papers representing all three access tiers',
          action: 'Select Papers',
          link: '/search',
          icon: CheckCircle
        },
        {
          number: 4,
          title: 'Resource Management',
          description: 'Use citation tools and manage diverse paper sources',
          action: 'Manage Sources',
          link: '/citations',
          icon: Quote
        }
      ],
      deliverables: [
        'Research Source Strategy document',
        '5 selected papers with justifications',
        'Plan for managing different access tiers',
        'Advantages/disadvantages analysis'
      ]
    },
    {
      id: 'academic-integrity',
      title: 'Academic Integrity and Finalization',
      description: 'Ensure paper is error-free and original before submission',
      difficulty: 'Beginner',
      duration: '30-45 minutes',
      icon: Shield,
      color: 'bg-red-50 text-red-600',
      steps: [
        {
          number: 1,
          title: 'Upload Draft',
          description: 'Paste your 2,000-word draft into the text editor',
          action: 'Upload Text',
          link: '/grammar',
          icon: Edit3
        },
        {
          number: 2,
          title: 'Grammar Check',
          description: 'Identify and fix grammatical errors automatically',
          action: 'Check Grammar',
          link: '/grammar',
          icon: Edit3
        },
        {
          number: 3,
          title: 'Plagiarism Check',
          description: 'Detect accidental plagiarism and properly cited content',
          action: 'Check Plagiarism',
          link: '/plagiarism',
          icon: Shield
        },
        {
          number: 4,
          title: 'Final Review',
          description: 'Review corrections and ensure originality',
          action: 'Review Results',
          link: '/grammar',
          icon: CheckCircle
        }
      ],
      deliverables: [
        'Academic Integrity Checklist Report',
        'Grammar issues and corrections',
        'Plagiarism detection results',
        'Final corrections and justification'
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Project Templates</h1>
        <p className="text-lg text-gray-600">
          Choose from our ready-to-use research project templates designed for different skill levels and objectives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projectTemplates.map((template) => (
          <div key={template.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${template.color}`}>
                  <template.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
                  <p className="text-gray-600">{template.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
                <span className="text-sm text-gray-500">{template.duration}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Project Steps:</h4>
              <div className="space-y-3">
                {template.steps.map((step) => (
                  <div key={step.number} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">{step.title}</h5>
                        <Link 
                          to={step.link}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                        >
                          {step.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Deliverables:</h4>
              <ul className="space-y-1">
                {template.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedTemplate(template)}
                className="btn-primary flex-1"
              >
                Start This Project
              </button>
              <button className="btn-secondary">
                Save Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Start: {selectedTemplate.title}</h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                    {selectedTemplate.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Estimated Duration:</span>
                  <span className="text-gray-600">{selectedTemplate.duration}</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Link
                  to={selectedTemplate.steps[0].link}
                  className="btn-primary flex-1 text-center"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Start Project
                </Link>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplates;
