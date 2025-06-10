import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import { Toaster } from 'sonner';
// Components
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { ScrollToTop } from './components/ScrollToTop';
import { PomodoroProvider } from './contexts/PomodoroContext';
import { TimeTrackingProvider } from './contexts/AutoTimeTrackingContext';
import { LoadingScreen } from './components/animations';

// Routes
import { appRoutes } from './routes';

// Services
import { openaiService } from './services/openai';

// AppRoutes component to use the useRoutes hook
const AppRoutes = () => {
  const routes = useRoutes(appRoutes);
  return routes;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize OpenAI API key on app startup
  useEffect(() => {
    const initializeApiKey = async () => {
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (envApiKey && envApiKey.trim() !== '') {
        try {
          // Clear any old stored keys first to prevent conflicts
          sessionStorage.removeItem('_ak');
          localStorage.removeItem('openaiApiKey');
          localStorage.removeItem('openai-api-key');

          // Initialize the centralized OpenAI service
          await openaiService.setApiKey(envApiKey);
          console.log('[App] OpenAI API key initialized from environment variables');
        } catch (error) {
          console.error('[App] Failed to initialize OpenAI API key:', error);
        }
      }
    };

    initializeApiKey();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      <PomodoroProvider>
        <TimeTrackingProvider>
          <ErrorBoundary>
            {isLoading ? (
              <LoadingScreen onComplete={handleLoadingComplete} duration={2500} />
            ) : (
              <Router>
                <ScrollToTop />
                <Toaster richColors position="top-center" />

                <AppRoutes />
                {/* AuthListener removed, AuthGuard will handle protection */}
              </Router>
            )}
          </ErrorBoundary>
        </TimeTrackingProvider>
      </PomodoroProvider>
    </ThemeProvider>
  );
}

export default App;