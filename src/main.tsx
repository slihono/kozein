import './theme/bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { isTauri } from '@tauri-apps/api/core';
import { t } from './i18n';

const desktop = isTauri();
document.body.dataset.platform = desktop ? 'native' : 'web';
const RootApp = React.lazy(() => desktop
  ? import('./App').then((module) => ({ default: module.App }))
  : import('./WebApp').then((module) => ({ default: module.WebApp })));
import { initI18n } from './i18n';
import '@fontsource-variable/inter';
import './theme/global.css';
import './theme/themes.css';
import './theme/browse.css';
import './theme/detail.css';
import './theme/lists.css';
import './theme/fun.css';

// The language remembered from the last run is loaded first, so the first frame is already in it.
void initI18n().finally(() =>
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <React.Suspense fallback={<p role="status">{t('common.loading')}</p>}>
        <RootApp />
      </React.Suspense>
    </React.StrictMode>
  )
);
