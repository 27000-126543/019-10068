import { createBrowserRouter, Navigate } from 'react-router-dom';
import TaskDispatchPage from '@/pages/TaskDispatchPage';
import DualReviewPage from '@/pages/DualReviewPage';
import LexiconReviewPage from '@/pages/LexiconReviewPage';
import AppShell from '@/components/layout/AppShell';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/tasks" replace />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        path: 'tasks',
        element: <TaskDispatchPage />,
      },
      {
        path: 'review/:articleId',
        element: <DualReviewPage />,
      },
      {
        path: 'lexicon',
        element: <LexiconReviewPage />,
      },
    ],
  },
  {
    path: '*',
    element: <div className="p-20 text-center">404 页面不存在</div>,
  },
]);

export default router;
