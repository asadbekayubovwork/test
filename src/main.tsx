import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TelegramProvider } from './lib/telegram/index'
import { I18nProvider } from './lib/i18n'

createRoot(document.getElementById('root')!).render(
  <TelegramProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </TelegramProvider>,
)
