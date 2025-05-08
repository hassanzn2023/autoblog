
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
import AutoblogCreatePage from './pages/AutoblogCreatePage';
import AutoblogListPage from './pages/AutoblogListPage';
import AutoblogTemplatePage from './pages/AutoblogTemplatePage';
import HelpCenterPage from './pages/HelpCenterPage';
import BenefitsPage from './pages/BenefitsPage';
import RequestFeaturePage from './pages/RequestFeaturePage';
import ApiDashboardPage from './pages/ApiDashboardPage';
import GetStartedPage from './pages/GetStartedPage';

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
        path: 'get-started',
        element: <GetStartedPage />
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
        path: 'autoblog/create',
        element: <AutoblogCreatePage />
      },
      {
        path: 'autoblog/list',
        element: <AutoblogListPage />
      },
      {
        path: 'autoblog/template',
        element: <AutoblogTemplatePage />
      },
      {
        path: 'autoblog/config',
        element: <AutoblogConfigPage />
      },
      {
        path: 'autoblog/config/:id',
        element: <AutoblogConfigPage />
      },
      {
        path: 'blog',
        element: <BlogProjectsPage />
      },
      {
        path: 'blog/create',
        element: <BlogProjectsPage />
      },
      {
        path: 'blog/articles',
        element: <BlogProjectsPage />
      },
      {
        path: 'blog/template',
        element: <BlogProjectsPage />
      },
      {
        path: 'blog/config',
        element: <BlogConfigPage />
      },
      {
        path: 'blog/config/:id',
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
        path: 'benefits',
        element: <BenefitsPage />
      },
      {
        path: 'request-feature',
        element: <RequestFeaturePage />
      },
      {
        path: 'api-dashboard',
        element: <ApiDashboardPage />
      },
      {
        path: 'help',
        element: <HelpCenterPage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

export default routes;
