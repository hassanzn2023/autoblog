
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
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { APIKeysProvider } from './contexts/APIKeysContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import AuthRequired from './components/AuthRequired';

const routes = [
  // Auth routes outside of main layout
  {
    path: '/auth',
    element: (
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthProvider>
        <AuthPage defaultTab="signup" />
      </AuthProvider>
    ),
  },
  // Main application routes
  {
    path: '/',
    element: (
      <AuthProvider>
        <WorkspaceProvider>
          <APIKeysProvider>
            <SubscriptionProvider>
              <Layout />
            </SubscriptionProvider>
          </APIKeysProvider>
        </WorkspaceProvider>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <AuthRequired><Index /></AuthRequired>
      },
      {
        path: 'settings',
        element: <AuthRequired><SettingsPage /></AuthRequired>
      },
      {
        path: 'get-started',
        element: <AuthRequired><GetStartedPage /></AuthRequired>
      },
      {
        path: 'history',
        element: <AuthRequired><HistoryPage /></AuthRequired>
      },
      {
        path: 'content-settings',
        element: <AuthRequired><AutoblogTemplatePage /></AuthRequired>
      },
      {
        path: 'autoblog',
        element: <AuthRequired><AutoblogPage /></AuthRequired>
      },
      {
        path: 'autoblog/create',
        element: <AuthRequired><AutoblogCreatePage /></AuthRequired>
      },
      {
        path: 'autoblog/list',
        element: <AuthRequired><AutoblogListPage /></AuthRequired>
      },
      {
        path: 'autoblog/config',
        element: <AuthRequired><AutoblogConfigPage /></AuthRequired>
      },
      {
        path: 'autoblog/config/:id',
        element: <AuthRequired><AutoblogConfigPage /></AuthRequired>
      },
      {
        path: 'blog',
        element: <AuthRequired><BlogProjectsPage /></AuthRequired>
      },
      {
        path: 'blog/create',
        element: <AuthRequired><BlogProjectsPage /></AuthRequired>
      },
      {
        path: 'blog/articles',
        element: <AuthRequired><BlogProjectsPage /></AuthRequired>
      },
      {
        path: 'blog/config',
        element: <AuthRequired><BlogConfigPage /></AuthRequired>
      },
      {
        path: 'blog/config/:id',
        element: <AuthRequired><BlogConfigPage /></AuthRequired>
      },
      {
        path: 'autofix/modes',
        element: <AuthRequired><ModeSelectionPage /></AuthRequired>
      },
      {
        path: 'autofix/normal',
        element: <AuthRequired><NormalModePage /></AuthRequired>
      },
      {
        path: 'autofix/pro',
        element: <AuthRequired><ProModePage /></AuthRequired>
      },
      {
        path: 'seo-checker',
        element: <AuthRequired><SEOCheckerPage /></AuthRequired>
      },
      {
        path: 'writing-style',
        element: <AuthRequired><WritingStylePage /></AuthRequired>
      },
      {
        path: 'preferences',
        element: <AuthRequired><PreferencesPage /></AuthRequired>
      },
      {
        path: 'profile',
        element: <AuthRequired><ProfilePage /></AuthRequired>
      },
      {
        path: 'usage',
        element: <AuthRequired><UsagePage /></AuthRequired>
      },
      {
        path: 'billing',
        element: <AuthRequired><BillingPage /></AuthRequired>
      },
      {
        path: 'teams',
        element: <AuthRequired><TeamsPage /></AuthRequired>
      },
      {
        path: 'integrations',
        element: <AuthRequired><IntegrationsPage /></AuthRequired>
      },
      {
        path: 'benefits',
        element: <AuthRequired><BenefitsPage /></AuthRequired>
      },
      {
        path: 'request-feature',
        element: <AuthRequired><RequestFeaturePage /></AuthRequired>
      },
      {
        path: 'api-dashboard',
        element: <AuthRequired><ApiDashboardPage /></AuthRequired>
      },
      {
        path: 'help',
        element: <AuthRequired><HelpCenterPage /></AuthRequired>
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

export default routes;
