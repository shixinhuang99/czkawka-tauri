import { LoaderCircle } from 'lucide-react';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useT } from '~/hooks';
import { initI18n } from '~/i18n';
import { migrate } from '~/utils/migrate';

function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <LoaderCircle className="animate-spin size-8" />
    </div>
  );
}

function ErrorFallback({ error }: FallbackProps) {
  const t = useT();

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div>
        <p className="text-lg font-bold text-red-500">
          {t('somethingWentWrong')}
        </p>
        <p>{error.message}</p>
      </div>
    </div>
  );
}

const App = lazy(() => import('./app'));

function main() {
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('no root element');
  }

  migrate();
  initI18n();

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
  );
}

main();
