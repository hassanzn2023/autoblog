
import React from 'react';
import Layout from './components/Layout';
import Index from './pages/Index';
import HistoryPage from './pages/HistoryPage';
import AutoblogPage from './pages/AutoblogPage';
import BlogProjectsPage from './pages/BlogProjectsPage';
import ModeSelectionPage from './pages/ModeSelectionPage';
import NormalModePage from './pages/NormalModePage';
import ProModePage from './pages/ProModePage';
import SEOCheckerPage from './pages/SEOCheckerPage';
import WritingStylePage from './pages/WritingStylePage';
import NotFound from './pages/NotFound';
import AutoblogConfigPage from './pages/AutoblogConfigPage';
import BlogConfigPage from './pages/BlogConfigPage';
import PreferencesPage from './pages/PreferencesPage';
import ProfilePage from './pages/ProfilePage';
import UsagePage from './pages/UsagePage';
import BillingPage from './pages/BillingPage';
import TeamsPage from './pages/TeamsPage';
import IntegrationsPage from './pages/IntegrationsPage';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: 'history',
        element: <HistoryPage />
      },
      {
        path: 'autoblog',
        element: <AutoblogPage />
      },
      {
        path: 'autoblog/config',
        element: <AutoblogConfigPage />
      },
      {
        path: 'blog',
        element: <BlogProjectsPage />
      },
      {
        path: 'blog/config',
        element: <BlogConfigPage />
      },
      {
        path: 'autofix/modes',
        element: <ModeSelectionPage />
      },
      {
        path: 'autofix/normal',
        element: <NormalModePage />
      },
      {
        path: 'autofix/pro',
        element: <ProModePage />
      },
      {
        path: 'seo-checker',
        element: <SEOCheckerPage />
      },
      {
        path: 'writing-style',
        element: <WritingStylePage />
      },
      {
        path: 'preferences',
        element: <PreferencesPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'usage',
        element: <UsagePage />
      },
      {
        path: 'billing',
        element: <BillingPage />
      },
      {
        path: 'teams',
        element: <TeamsPage />
      },
      {
        path: 'integrations',
        element: <IntegrationsPage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

export default routes;
