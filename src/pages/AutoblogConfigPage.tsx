
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ConfigWizard from '@/components/common/ConfigWizard';
import BasicSetupStep from '@/components/wizard/BasicSetupStep';

const AutoblogConfigPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch the campaign data if editing (id !== 'new')
    if (id === 'new') {
      // Parse the name from query string if creating a new campaign
      const searchParams = new URLSearchParams(location.search);
      const nameFromQuery = searchParams.get('name');
      setCampaignName(nameFromQuery || 'New Campaign');
    } else if (id === '1') {
      setCampaignName('Default Campaign');
    } else if (id === '2') {
      setCampaignName('قسنط');
    }
  }, [id, location.search]);
  
  const handleUpdate = (field: string, value: string) => {
    if (field === 'name') setCampaignName(value);
    if (field === 'description') setCampaignDescription(value);
  };

  const wizardSteps = [
    {
      id: 'basic-setup',
      title: 'Basic Setup',
      visibleFor: 'all' as const,
      component: (
        <BasicSetupStep
          configType="autoblog"
          name={campaignName}
          description={campaignDescription}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'business-profile',
      title: 'Business & Content Profile',
      visibleFor: 'all' as const,
      component: <div>Business & Content Profile form goes here</div>,
    },
    {
      id: 'topic-foundation',
      title: 'Topic & Content Foundation',
      visibleFor: 'all' as const,
      component: <div>Topic & Content Foundation form goes here</div>,
    },
    {
      id: 'keyword-research',
      title: 'Keyword Research',
      visibleFor: 'blog' as const,
      component: <div>Keyword Research form goes here</div>,
    },
    {
      id: 'ai-generation',
      title: 'AI & Content Generation',
      visibleFor: 'all' as const,
      component: <div>AI & Content Generation form goes here</div>,
    },
    {
      id: 'linking-seo',
      title: 'Linking & SEO',
      visibleFor: 'all' as const,
      component: <div>Linking & SEO form goes here</div>,
    },
    {
      id: 'media-formatting',
      title: 'Media & Formatting',
      visibleFor: 'all' as const,
      component: <div>Media & Formatting form goes here</div>,
    },
    {
      id: 'select-title',
      title: 'Select a Title',
      visibleFor: 'blog' as const,
      component: <div>Select a Title form goes here</div>,
    },
    {
      id: 'content-outline',
      title: 'Content Outline',
      visibleFor: 'blog' as const,
      component: <div>Content Outline form goes here</div>,
    },
    {
      id: 'scheduling',
      title: 'Scheduling & Integration',
      visibleFor: 'all' as const,
      component: <div>Scheduling & Integration form goes here</div>,
    },
    {
      id: 'review-save',
      title: 'Review & Save',
      visibleFor: 'all' as const,
      component: <div>Review & Save form goes here</div>,
    },
  ];

  return (
    <ConfigWizard 
      title={`Configure Campaign`}
      configType="autoblog"
      name={campaignName}
      steps={wizardSteps}
    />
  );
};

export default AutoblogConfigPage;
