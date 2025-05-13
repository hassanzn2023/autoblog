
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import UsagePage from './pages/UsagePage';
import SettingsPage from './pages/SettingsPage';
import PreferencesPage from './pages/PreferencesPage';
import RequestFeaturePage from './pages/RequestFeaturePage';
import ApiDashboardPage from './pages/ApiDashboardPage';
import WritingStylePage from './pages/WritingStylePage';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import TeamPage from './pages/TeamsPage';
import BillingPage from './pages/BillingPage';
import BenefitsPage from './pages/BenefitsPage';
import HistoryPage from './pages/HistoryPage';
import IntegrationsPage from './pages/IntegrationsPage';
import GetStartedPage from './pages/GetStartedPage';
import AutoblogPage from './pages/AutoblogPage';
import AutoblogTemplatePage from './pages/AutoblogTemplatePage';
import AutoblogListPage from './pages/AutoblogListPage';
import AutoblogCreatePage from './pages/AutoblogCreatePage';
import AutoblogConfigPage from './pages/AutoblogConfigPage';
import BlogProjectsPage from './pages/BlogProjectsPage';
import BlogConfigPage from './pages/BlogConfigPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ModeSelectionPage from './pages/ModeSelectionPage';
import ProModePage from './pages/ProModePage';
import NormalModePage from './pages/NormalModePage';
import SEOCheckerPage from './pages/SEOCheckerPage';
import QuickSEOPage from './pages/QuickSEOPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Index />
      },
      {
        path: '/usage',
        element: <UsagePage />
      },
      {
        path: '/api-dashboard',
        element: <ApiDashboardPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      },
      {
        path: '/preferences',
        element: <PreferencesPage />
      },
      {
        path: '/writing-style',
        element: <WritingStylePage />
      },
      {
        path: '/request-feature',
        element: <RequestFeaturePage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/teams',
        element: <TeamPage />
      },
      {
        path: '/billing',
        element: <BillingPage />
      },
      {
        path: '/benefits',
        element: <BenefitsPage />
      },
      {
        path: '/history',
        element: <HistoryPage />
      },
      {
        path: '/integrations',
        element: <IntegrationsPage />
      },
      {
        path: '/get-started',
        element: <GetStartedPage />
      },
      {
        path: '/autoblog',
        element: <AutoblogPage />
      },
      {
        path: '/autoblog/templates',
        element: <AutoblogTemplatePage />
      },
      {
        path: '/autoblog/list',
        element: <AutoblogListPage />
      },
      {
        path: '/autoblog/create',
        element: <AutoblogCreatePage />
      },
      {
        path: '/autoblog/config',
        element: <AutoblogConfigPage />
      },
      {
        path: '/blog-projects',
        element: <BlogProjectsPage />
      },
      {
        path: '/blog/config',
        element: <BlogConfigPage />
      },
      {
        path: '/help-center',
        element: <HelpCenterPage />
      },
      {
        path: '/mode',
        element: <ModeSelectionPage />
      },
      {
        path: '/pro-mode',
        element: <ProModePage />
      },
      {
        path: '/normal-mode',
        element: <NormalModePage />
      },
      {
        path: '/seo-checker',
        element: <SEOCheckerPage />
      },
      {
        path: '/quick-seo',
        element: <QuickSEOPage />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthPage />
  }
]);
