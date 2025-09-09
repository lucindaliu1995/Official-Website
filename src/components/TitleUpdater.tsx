'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const EN_TITLE = 'AI Agent for Product Carbon Footprint Accounting & Assurance | Climate Seal';
const ZH_TITLE = 'Climate Seal - AI碳盘查与供应链碳足迹核算系统';

export default function TitleUpdater() {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = language === 'zh' ? ZH_TITLE : EN_TITLE;
  }, [language]);

  return null;
}


