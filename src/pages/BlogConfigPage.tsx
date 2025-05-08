
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ConfigWizard from '@/components/common/ConfigWizard';
import BasicSetupStep from '@/components/wizard/BasicSetupStep';

const BlogConfigPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch the project data if editing (id !== 'new')
    if (id === 'new') {
      // Parse the name from query string if creating a new blog project
      const searchParams = new URLSearchParams(location.search);
      const nameFromQuery = searchParams.get('name');
      setProjectName(nameFromQuery || 'New Blog Project');
    } else if (id === '1') {
      setProjectName('My First Blog');
    }
  }, [id, location.search]);
  
  const handleUpdate = (field: string, value: string) => {
    if (field === 'name') setProjectName(value);
    if (field === 'description') setProjectDescription(value);
  };

  const wizardSteps = [
    {
      id: 'basic-setup',
      title: 'Basic Setup',
      visibleFor: 'all',
      component: (
        <BasicSetupStep
          configType="blog"
          name={projectName}
          description={projectDescription}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'business-profile',
      title: 'Business & Content Profile',
      visibleFor: 'all',
      component: <div>Business & Content Profile form goes here</div>,
    },
    {
      id: 'topic-foundation',
      title: 'Topic & Content Foundation',
      visibleFor: 'all',
      component: <div>Topic & Content Foundation form goes here</div>,
    },
    {
      id: 'keyword-research',
      title: 'Keyword Research',
      visibleFor: 'blog', // Only for blog
      component: <div>Keyword Research form goes here</div>,
    },
    {
      id: 'ai-generation',
      title: 'AI & Content Generation',
      visibleFor: 'all',
      component: <div>AI & Content Generation form goes here</div>,
    },
    {
      id: 'linking-seo',
      title: 'Linking & SEO',
      visibleFor: 'all',
      component: <div>Linking & SEO form goes here</div>,
    },
    {
      id: 'media-formatting',
      title: 'Media & Formatting',
      visibleFor: 'all',
      component: <div>Media & Formatting form goes here</div>,
    },
    {
      id: 'select-title',
      title: 'Select a Title',
      visibleFor: 'blog', // Only for blog
      component: <div>Select a Title form goes here</div>,
    },
    {
      id: 'content-outline',
      title: 'Content Outline',
      visibleFor: 'blog', // Only for blog
      component: <div>Content Outline form goes here</div>,
    },
    {
      id: 'scheduling',
      title: 'Scheduling & Integration',
      visibleFor: 'all',
      component: <div>Scheduling & Integration form goes here</div>,
    },
    {
      id: 'review-save',
      title: 'Review & Save',
      visibleFor: 'all',
      component: <div>Review & Save form goes here</div>,
    },
  ];

  return (
    <ConfigWizard 
      title={`Configure Blog Project`}
      configType="blog"
      name={projectName}
      steps={wizardSteps}
    />
  );
};

export default BlogConfigPage;
