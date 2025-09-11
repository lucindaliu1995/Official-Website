'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import ExpandableCards from '@/components/ExpandableCards';
import { motion } from 'framer-motion';

export default function Home() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [visibleCards, setVisibleCards] = useState({ card2: false, card3: false });
  const [solutionBarVisible, setSolutionBarVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [painSectionTop, setPainSectionTop] = useState(0);
  const [painSectionBottom, setPainSectionBottom] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activePersona, setActivePersona] = useState<'carbonExpert' | 'brandOwner' | 'supplyChain'>('brandOwner');
  const [activeAIRole, setActiveAIRole] = useState<'carbonExpert' | 'brandOwner' | 'supplyChain'>('brandOwner');
  const [activeMobileCard, setActiveMobileCard] = useState<number>(-1);

  // Generate cards data for current role
  const getCardsForRole = (role: 'carbonExpert' | 'brandOwner' | 'supplyChain') => {
    const assistants = t.sections.aiAssistants.assistants[role];
    
    if (role === 'carbonExpert') {
      return [
        {
          title: assistants.carbonCalculator.title,
          summary: assistants.carbonCalculator.description,
          gradient: "from-purple-500/25 to-violet-500/25",
          background: "bg-gradient-to-b from-purple-600/70 to-purple-800/70",
          staticMediaSrc: "/reg-advisor.png",
          dynamicMediaSrc: "/videos/video1-card.mp4"
        },
        {
          title: assistants.complianceTracker.title,
          summary: assistants.complianceTracker.description,
          gradient: "from-emerald-500/25 to-green-600/25",
          background: "bg-gradient-to-b from-green-600/70 to-green-800/70",
          staticMediaSrc: "/data-intake-steward.png",
          dynamicMediaSrc: "/videos/video2-card.mp4"
        },
        {
          title: assistants.climateSeal.title,
          summary: assistants.climateSeal.description,
          gradient: "from-sky-500/25 to-blue-600/25",
          background: "bg-gradient-to-b from-blue-600/70 to-blue-800/70",
          staticMediaSrc: "/pcf-modeler.png",
          dynamicMediaSrc: "/videos/video3-card.mp4"
        },
        {
          title: assistants.supplyChainAnalyzer.title,
          summary: assistants.supplyChainAnalyzer.description,
          gradient: "from-orange-500/25 to-amber-600/25",
          background: "bg-gradient-to-b from-orange-600/70 to-orange-800/70",
          staticMediaSrc: "/qa-anomaly-detector.png",
          dynamicMediaSrc: "/videos/video4-card.mp4"
        }
      ];
    } else if (role === 'brandOwner') {
      return [
        {
          title: assistants.brandAnalyzer.title,
          summary: assistants.brandAnalyzer.description,
          gradient: "from-pink-500/25 to-rose-500/25",
          background: "bg-gradient-to-b from-pink-600/70 to-pink-800/70",
          staticMediaSrc: "/brand-analyzer.png",
          dynamicMediaSrc: "/videos/video1-card.mp4"
        },
        {
          title: assistants.scopeTracker.title,
          summary: assistants.scopeTracker.description,
          gradient: "from-indigo-500/25 to-purple-500/25",
          background: "bg-gradient-to-b from-indigo-600/70 to-indigo-800/70",
          staticMediaSrc: "/scope-tracker.png",
          dynamicMediaSrc: "/videos/video2-card.mp4"
        },
        {
          title: assistants.sustainabilityReporter.title,
          summary: assistants.sustainabilityReporter.description,
          gradient: "from-emerald-500/25 to-teal-500/25",
          background: "bg-gradient-to-b from-emerald-600/70 to-emerald-800/70",
          staticMediaSrc: "/sustainability-reporter.png",
          dynamicMediaSrc: "/videos/video3-card.mp4"
        },
        {
          title: assistants.goalManager.title,
          summary: assistants.goalManager.description,
          gradient: "from-violet-500/25 to-purple-500/25",
          background: "bg-gradient-to-b from-violet-600/70 to-violet-800/70",
          staticMediaSrc: "/goal-manager.png",
          dynamicMediaSrc: "/videos/video4-card.mp4"
        }
      ];
    } else {
      return [
        {
          title: assistants.supplierAssessment.title,
          summary: assistants.supplierAssessment.description,
          gradient: "from-rose-500/25 to-pink-500/25",
          background: "bg-gradient-to-b from-rose-600/70 to-rose-800/70",
          staticMediaSrc: "/supply-chain-assessment.png",
          dynamicMediaSrc: "/videos/video1-card.mp4"
        },
        {
          title: assistants.exportCompliance.title,
          summary: assistants.exportCompliance.description,
          gradient: "from-slate-500/25 to-gray-500/25",
          background: "bg-gradient-to-b from-slate-600/70 to-slate-800/70",
          staticMediaSrc: "/export-compliance.png",
          dynamicMediaSrc: "/videos/video2-card.mp4"
        },
        {
          title: assistants.costOptimizer.title,
          summary: assistants.costOptimizer.description,
          gradient: "from-lime-500/25 to-green-500/25",
          background: "bg-gradient-to-b from-lime-600/70 to-lime-800/70",
          staticMediaSrc: "/cost-optimizer.png",
          dynamicMediaSrc: "/videos/video3-card.mp4"
        }
      ];
    }
  };

  useEffect(() => {
    // 检测是否为移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // 滚动控制和横幅显示逻辑
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      setScrollDirection(direction);
      setIsScrolling(true);
      
      // 清除之前的滚动停止计时器
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // 设置新的滚动停止计时器
      const newTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150); // 150ms后认为滚动停止
      setScrollTimeout(newTimeout);
      
      // 精确的位置触发 - 基于Pain Section标题位置和滚动方向，移动端和桌面端不同触发时机
      const painSectionTitle = document.querySelector('[data-section-id="pain-section-title"]');
      if (painSectionTitle) {
        const rect = painSectionTitle.getBoundingClientRect();
        const isMobile = window.innerWidth < 1024;
        
        // 不同设备的触发阈值
        const triggerThreshold = isMobile ? 50 : 200; // 移动端50px，桌面端200px
        
        // 触发显示：当标题距离顶端达到阈值时显示横幅
        if (rect.top <= triggerThreshold && rect.bottom > 0) {
          setSolutionBarVisible(true);
        } 
        // 只有在向下滑动且标题已经远离时才隐藏
        else if (direction === 'down' && rect.top > triggerThreshold) {
          setSolutionBarVisible(false);
        }
        // 向上滑动时，无论位置如何都保持当前状态（不改变）
        
      } else {
        // 如果找不到标题元素，使用临时的始终显示
        setSolutionBarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // 延迟一点确保DOM已经渲染
    const timer = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute('data-card-id');
          
          if (cardId === 'card2' && entry.isIntersecting) {
            setVisibleCards(prev => ({ ...prev, card2: true }));
          } else if (cardId === 'card3' && entry.isIntersecting) {
            setVisibleCards(prev => ({ ...prev, card3: true }));
          } else if (cardId === 'pain-cards') {
            // 记录痛点区域的位置
            const rect = entry.target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setPainSectionTop(scrollTop + rect.top);
            setPainSectionBottom(scrollTop + rect.bottom);
          }
        });
      }, observerOptions);
      
      const card2 = document.querySelector('[data-card-id="card2"]');
      const card3 = document.querySelector('[data-card-id="card3"]');
      const painCards = document.querySelector('[data-card-id="pain-cards"]');
      
      if (card2) observer.observe(card2);
      if (card3) observer.observe(card3);
      if (painCards) {
        observer.observe(painCards);
      }

      // 添加滚动监听器
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        if (card2) observer.unobserve(card2);
        if (card3) observer.unobserve(card3);
        if (painCards) observer.unobserve(painCards);
        window.removeEventListener('scroll', handleScroll);
      };
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [lastScrollY, painSectionTop, painSectionBottom, scrollTimeout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必需字段
    if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.industry || !formData.message) {
      setSubmitMessage(t.contact.messages.validation);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 使用服务器返回的消息，如果没有则使用默认成功消息
        setSubmitMessage(data.message || t.contact.messages.success);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          industry: '',
          message: ''
        });
      } else {
        // 使用服务器返回的错误消息，如果没有则使用默认错误消息
        setSubmitMessage(data.message || t.contact.messages.error);
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      setSubmitMessage(t.contact.messages.error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <style jsx global>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-4px) translateX(1px) scale(1.008) rotate(0.3deg);
          }
          50% {
            transform: translateY(-6px) translateX(0px) scale(1.012) rotate(0deg);
          }
          75% {
            transform: translateY(-4px) translateX(-1px) scale(1.008) rotate(-0.3deg);
          }
        }
        
        @keyframes float-gentle-delayed {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-3px) translateX(-1px) scale(1.006) rotate(-0.2deg);
          }
          50% {
            transform: translateY(-5px) translateX(0px) scale(1.010) rotate(0deg);
          }
          75% {
            transform: translateY(-3px) translateX(1px) scale(1.006) rotate(0.2deg);
          }
        }
        
        @keyframes float-gentle-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          20% {
            transform: translateY(-2px) translateX(1px) scale(1.004) rotate(0.4deg);
          }
          40% {
            transform: translateY(-7px) translateX(0px) scale(1.014) rotate(0deg);
          }
          60% {
            transform: translateY(-5px) translateX(-1px) scale(1.010) rotate(-0.2deg);
          }
          80% {
            transform: translateY(-2px) translateX(0px) scale(1.006) rotate(0.1deg);
          }
        }
        
        @keyframes float-gentle-smooth {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          30% {
            transform: translateY(-3px) translateX(0.5px) scale(1.005) rotate(0.15deg);
          }
          70% {
            transform: translateY(-5px) translateX(-0.5px) scale(1.009) rotate(-0.15deg);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
        
        .animate-float-gentle-delayed {
          animation: float-gentle-delayed 5s ease-in-out infinite 1s;
        }
        
        .animate-float-gentle-slow {
          animation: float-gentle-slow 6s ease-in-out infinite 2s;
        }
        
        .animate-float-gentle-smooth {
          animation: float-gentle-smooth 4.5s ease-in-out infinite 0.5s;
        }
        
        .top-55 {
          top: 13.75rem; /* 55 * 0.25rem = 13.75rem = 220px */
        }
        
        .text-cyan-custom {
          color: #c2f5f7 !important;
        }
      `}</style>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-[rgb(0,52,50)] relative overflow-hidden" data-theme="home" data-section="home-hero" data-category="landing">
        {/* Background overlay - removed for unified color */}
        
        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left text-white px-4 lg:px-16 order-2 lg:order-1 mt-6 lg:mt-0 lg:translate-x-8 lg:translate-y-4">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 relative z-20">
              {/* Keep mobile unchanged; on desktop enforce no-wrap for specific phrases */}
              <span className="md:hidden">{t.hero.title}</span>
              <span className="hidden md:inline">
                {(() => {
                  const title = t.hero.title;
                  const aiAgent = 'AI Agent for';
                  const pcf = 'Product Carbon Footprint';
                  const accounting = 'Accounting & Assurance';
                  if (title.includes(aiAgent) && title.includes(pcf) && title.includes(accounting)) {
                    return (
                      <>
                        <span className="whitespace-nowrap">{aiAgent}</span>{' '}
                        <span className="whitespace-nowrap">{pcf}</span>{' '}
                        <span>{accounting}</span>
                      </>
                    );
                  }
                  return title;
                })()}
              </span>
            </h1>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-lg font-light leading-snug mb-4 whitespace-pre-line">
              {t.hero.subtitle}
            </h2>
            {/* Mobile: show only short headings */}
            <div className="md:hidden text-sm sm:text-base mb-8 font-light opacity-90 text-center space-y-2">
              {t.hero.description.split('\n').map((line, idx) => (
                <div key={idx} className="inline-flex items-center justify-center gap-2 w-full">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                  <span className="block">{line.split(' - ')[0]}</span>
                </div>
              ))}
            </div>
            <a 
              href="#contact"
              className="bg-yellow-400 hover:bg-yellow-500 text-[rgb(0,52,50)] px-6 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition duration-300 inline-flex items-center gap-2 mt-2 whitespace-pre-line text-center leading-none"
              data-cta="hero-get-started"
              data-section="home-hero"
            >
              {t.hero.getStarted}
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          {/* Polar Bears Image */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-full lg:min-h-screen order-1 lg:order-2">
            <Image
              src="/polar-bears.png"
              alt="Polar Bears Swimming"
              fill
              className="object-contain object-center filter drop-shadow-lg"
              priority
              quality={100}
              unoptimized={true}
              style={{
                imageRendering: 'crisp-edges',
                filter: 'contrast(1.0) brightness(1.0) saturate(1.0) hue-rotate(0deg)'
              }}
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70">
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="relative bg-[rgb(0,52,50)] py-16 overflow-hidden">
        
        {/* Mobile Version - Completely Redesigned */}
        <div className="block md:hidden px-4">
          {/* Mobile Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t.sections.personas?.title || 'Solutions for every role.'}
            </h2>
          </div>

          {/* Mobile Tab Navigation - Compact */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 rounded-full p-1">
              <div className="flex">
                {(['brandOwner', 'supplyChain', 'carbonExpert'] as const).map((persona) => (
                  <button
                    key={persona}
                    onClick={() => setActivePersona(persona)}
                    className={`px-3 py-2 text-xs font-medium transition-all duration-300 rounded-full ${
                      activePersona === persona
                        ? 'bg-[#6161ff] text-white'
                        : 'text-white/70'
                    }`}
                  >
                    {t.sections.personas[persona].title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Cards - Vertical Stack */}
          <div className="space-y-4">
            {/* Main Card - Compact */}
            <div className={`rounded-2xl p-4 ${
              activePersona === 'carbonExpert' ? 'bg-[#6161ff]' :
              activePersona === 'brandOwner' ? 'bg-[#8b5cf6]' :
              'bg-[#3b82f6]'
            }`}>
              <h3 className="text-white text-lg font-semibold mb-2">
                {t.sections.personas[activePersona].title}
              </h3>
              <p className="text-white text-sm leading-relaxed mb-3">
                {t.sections.personas[activePersona].needs}
              </p>
              <button 
                onClick={() => document.getElementById('ai-assistants')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white rounded-full px-4 py-1 text-black text-sm font-medium"
              >
                Learn More
              </button>
            </div>

            {/* Stats Card - Compact */}
            <div className="bg-[#f0f3ff] rounded-2xl p-4">
              {activePersona === 'carbonExpert' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.carbonExpert.stat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.carbonExpert.statDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.carbonExpert.secondStatDescription}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.carbonExpert.thirdStatDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.carbonExpert.fourthStat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.carbonExpert.fourthStatDescription}</p>
                  </div>
                </div>
              ) : activePersona === 'brandOwner' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.brandOwner.stat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.brandOwner.statDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.brandOwner.secondStatDescription}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.brandOwner.thirdStatDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.brandOwner.fourthStat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.brandOwner.fourthStatDescription}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.supplyChain.stat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.supplyChain.statDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.supplyChain.secondStatDescription}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.supplyChain.thirdStatDescription}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                    <div className="text-[#333] text-sm font-bold">{t.sections.personas.supplyChain.fourthStat}</div>
                    <p className="text-[#333] text-xs text-right">{t.sections.personas.supplyChain.fourthStatDescription}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Testimonial removed on mobile per request */}
          </div>
        </div>

        {/* Desktop Version - Keep Original Unchanged */}
        <div className="hidden md:block relative w-full max-w-[1200px] h-auto mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t.sections.personas?.title || 'Solutions for every role.'}
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 rounded-[1600px] p-1 shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1)]">
              <div className="relative flex">
                {(['brandOwner', 'supplyChain', 'carbonExpert'] as const).map((persona, index) => (
                  <button
                    key={persona}
                    onClick={() => setActivePersona(persona)}
                    className={`relative px-6 py-3 text-lg font-normal tracking-[-0.18px] leading-[23.4px] transition-all duration-300 ${
                      activePersona === persona
                        ? 'bg-[#6161ff] text-white rounded-[1600px]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {t.sections.personas[persona].title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Layout */}
          <div className="relative w-full flex justify-center">
            <div className="relative w-[1400px] transform translate-x-[-96px]">
              {/* Left Large Card */}
              <div className={`w-full lg:w-[950px] h-[420px] rounded-3xl relative mb-6 lg:mb-0 animate-fade-in ${
                activePersona === 'carbonExpert' ? 'bg-[#6161ff]' :
                activePersona === 'brandOwner' ? 'bg-[#8b5cf6]' :
                'bg-[#3b82f6]'
              }`}>
              {/* Logo/Brand Area */}
              <div className="absolute top-[108px] left-10 w-[309px] h-7">
              </div>

              {/* Main Title */}
              <div className="absolute top-[90px] left-10 w-[340px]">
                <h3 className="text-white text-[32px] font-normal tracking-[-0.80px] leading-[42px]">
                  {activePersona === 'carbonExpert' && t.sections.personas.carbonExpert.title}
                  {activePersona === 'brandOwner' && t.sections.personas.brandOwner.title}
                  {activePersona === 'supplyChain' && t.sections.personas.supplyChain.title}
                </h3>
              </div>

              {/* Description */}
              <div className={`absolute left-10 w-[300px] ${activePersona === 'brandOwner' ? 'top-[190px]' : 'top-[170px]'}`}>
                <p className="text-white text-base font-normal tracking-[-0.18px] leading-[24px]">
                  {t.sections.personas[activePersona].needs}
                </p>
              </div>

              {/* CTA Button */}
              <div className="absolute top-[320px] left-10">
                <button 
                  onClick={() => document.getElementById('ai-assistants')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white rounded-[160px] border border-solid px-8 py-2 flex items-center gap-2 hover:bg-gray-50 transition-all"
                >
                  <span className="text-black text-base font-normal tracking-[-0.16px] leading-[20.8px]">
                    Get More Detail
                  </span>
                  <svg className="w-3 h-2.5" viewBox="0 0 12 10" fill="none">
                    <path d="M7 1L11 5L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Product Interface Mock */}
              <div className="absolute top-0 right-0 w-[500px] h-[420px] rounded-r-3xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4 flex-1 pt-2">
                      {activePersona === 'carbonExpert' ? (
                        <>
                          <h4 className="text-white text-sm font-semibold mb-2 opacity-90">You Might Be Struggling With:</h4>
                          <div className="h-10 bg-white/20 rounded w-3/4 animate-shimmer flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.carbonExpert.painPoints[0]}</span>
                          </div>
                          <div className="h-12 bg-white/15 rounded w-full flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.carbonExpert.painPoints[1]}</span>
                          </div>
                          <div className="h-11 bg-white/25 rounded w-5/6 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.carbonExpert.painPoints[2]}</span>
                          </div>
                          <div className="h-10 bg-white/15 rounded w-4/5 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.carbonExpert.painPoints[3]}</span>
                          </div>
                          <div className="h-14 bg-white/20 rounded w-full flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.carbonExpert.painPoints[4]}</span>
                          </div>
                        </>
                      ) : activePersona === 'brandOwner' ? (
                        <div className="space-y-4 flex-1 pt-2">
                          <h4 className="text-white text-sm font-semibold mb-2 opacity-90">Common Challenges Include:</h4>
                          <div className="h-12 bg-white/20 rounded w-5/6 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.brandOwner.painPoints[0]}</span>
                          </div>
                          <div className="h-10 bg-white/15 rounded w-3/5 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.brandOwner.painPoints[1]}</span>
                          </div>
                          <div className="h-10 bg-white/25 rounded w-4/5 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.brandOwner.painPoints[2]}</span>
                          </div>
                          <div className="h-14 bg-white/15 rounded w-2/3 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.brandOwner.painPoints[3]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 flex-1 pt-2">
                          <h4 className="text-white text-sm font-semibold mb-2 opacity-90">You&rsquo;re Probably Facing:</h4>
                          <div className="h-11 bg-white/20 rounded w-4/5 animate-shimmer flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.supplyChain.painPoints[0]}</span>
                          </div>
                          <div className="h-12 bg-white/15 rounded w-3/4 flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.supplyChain.painPoints[1]}</span>
                          </div>
                          <div className="h-16 bg-white/25 rounded w-full flex items-center px-4">
                            <span className="text-white text-sm font-normal tracking-[-0.18px] leading-tight">{t.sections.personas.supplyChain.painPoints[2]}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Right Side Cards */}
              <div className="lg:absolute lg:top-0 lg:left-[970px] lg:w-[400px] flex flex-col gap-4">
              {/* First Card - 1 Minute */}
              <div className="w-full h-[128px] bg-[#f7f9ff] rounded-3xl p-3 border border-[#e6e8f2] shadow-sm animate-fade-up" style={{animationDelay: "0.2s"}}>
                {activePersona === 'carbonExpert' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.carbonExpert.stat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.carbonExpert.statDescription}
                    </p>
                  </div>
                ) : activePersona === 'brandOwner' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.brandOwner.stat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.brandOwner.statDescription}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.supplyChain.stat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.supplyChain.statDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Second Card - 95% Accuracy */}
              <div className="w-full h-[128px] bg-[#f7f9ff] rounded-3xl p-3 border border-[#e6e8f2] shadow-sm animate-fade-up" style={{animationDelay: "0.4s"}}>
                {activePersona === 'carbonExpert' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.carbonExpert.secondStatDescription}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.carbonExpert.thirdStatDescription}
                    </p>
                  </div>
                ) : activePersona === 'brandOwner' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.brandOwner.secondStatDescription}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.brandOwner.thirdStatDescription}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.supplyChain.secondStatDescription}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.supplyChain.thirdStatDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Third Card - DQR+ Industry Data */}
              <div className="w-full h-[128px] bg-[#f7f9ff] rounded-3xl p-3 border border-[#e6e8f2] shadow-sm animate-fade-up" style={{animationDelay: "0.6s"}}>
                {activePersona === 'carbonExpert' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.carbonExpert.fourthStat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.carbonExpert.fourthStatDescription}
                    </p>
                  </div>
                ) : activePersona === 'brandOwner' ? (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.brandOwner.fourthStat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.brandOwner.fourthStatDescription}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center h-full justify-between gap-3">
                    <div className="text-[#333333] text-[16px] lg:text-[18px] font-bold leading-tight tracking-[-0.5px]">
                      {t.sections.personas.supplyChain.fourthStat}
                    </div>
                    <p className="text-[#333333] text-xs lg:text-sm font-normal max-w-[240px] text-right leading-snug">
                      {t.sections.personas.supplyChain.fourthStatDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistants Section */}
      <section id="ai-assistants" className="relative bg-[rgb(0,52,50)] py-16 overflow-hidden">
        
        {/* Mobile Version - Completely Redesigned */}
        <div className="block md:hidden px-4">
          {/* Mobile Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              {t.sections.aiAssistants.title}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              {t.sections.aiAssistants.subtitle}
            </p>
          </div>

          {/* Mobile AI Role Navigation - Compact */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 rounded-full p-1">
              <div className="flex">
                {(['brandOwner', 'supplyChain', 'carbonExpert'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveAIRole(role);
                      setActiveMobileCard(-1); // Reset mobile card state when switching roles
                    }}
                    className={`px-3 py-2 text-xs font-medium transition-all duration-300 rounded-full ${
                      activeAIRole === role
                        ? 'bg-[#6161ff] text-white'
                        : 'text-white/70'
                    }`}
                  >
                    {t.sections.personas[role].title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile AI Assistant Cards - 2x2 Grid with Video Playback */}
          <div className="grid grid-cols-2 gap-3">
            {getCardsForRole(activeAIRole).map((card, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 cursor-pointer ${
                  activeMobileCard === index 
                    ? 'col-span-2 h-64 z-10' 
                    : 'h-48 hover:scale-105'
                }`}
                onClick={() => setActiveMobileCard(activeMobileCard === index ? -1 : index)}
              >
                {/* Background Gradient - Only show when no video is playing */}
                {!(card.dynamicMediaSrc && activeMobileCard === index) && (
                  <div className={`absolute inset-0 ${card.background || 'bg-gradient-to-b from-purple-600/70 to-purple-800/70'}`} />
                )}
                
                {/* Media Layer */}
                <div className="absolute inset-0">
                  {/* Static Animal Image - Shows when not expanded */}
                  {card.staticMediaSrc && activeMobileCard !== index && (
                    <img 
                      src={card.staticMediaSrc} 
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ 
                        objectPosition: card.staticMediaSrc.includes('scope-tracker') ? 'center 45%' :
                                       card.staticMediaSrc.includes('supply-chain') || 
                                       card.staticMediaSrc.includes('export-compliance') || 
                                       card.staticMediaSrc.includes('cost-optimizer') ? 'center 30%' :
                                       card.staticMediaSrc.includes('brand-analyzer') ||
                                       card.staticMediaSrc.includes('sustainability-reporter') ||
                                       card.staticMediaSrc.includes('goal-manager') ? 'center 35%' : 'center center'
                      }}
                    />
                  )}
                  
                  {/* Dynamic Video - Shows immediately when expanded */}
                  {card.dynamicMediaSrc && activeMobileCard === index && (
                    <video
                      key={`video-${index}-${activeMobileCard}`}
                      src={card.dynamicMediaSrc}
                      className="absolute inset-0 w-full h-full object-cover opacity-100"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls={false}
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        try { 
                          e.currentTarget.currentTime = 0;
                          e.currentTarget.play(); 
                        } catch (_) {}
                      }}
                      onCanPlay={(e) => {
                        try { 
                          e.currentTarget.play(); 
                        } catch (_) {}
                      }}
                    />
                  )}
                </div>
                
                {/* Content Overlay - Only at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                {/* Text Content - Compact at bottom */}
                <div className="absolute bottom-0 left-0 right-0">
                  {/* Expanded State - Video playing */}
                  {activeMobileCard === index ? (
                    <div className="p-3 bg-black/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white text-sm font-semibold leading-tight">
                          {card.title}
                        </h3>
                        <span className="text-white/60 text-xs">
                          {language === 'zh' ? '点击缩小' : 'Tap to close'}
                        </span>
                      </div>
                      <p className="text-white/90 text-xs leading-tight">
                        {card.summary}
                      </p>
                    </div>
                  ) : (
                    /* Collapsed State - Image showing */
                    <div className="p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-xs font-semibold leading-tight">
                          {card.title}
                        </h3>
                        <span className="text-white/60 text-xs">
                          {language === 'zh' ? '点击放大' : 'Tap to expand'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Action Button */}
          <div className="text-center mt-6">
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#9ef894] text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-[#8ee884] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Desktop Version - Keep Original Unchanged */}
        <div className="hidden md:block relative w-full max-w-[1450px] mx-auto px-4">

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t.sections.aiAssistants.title}
            </h2>
            <p className="text-xl text-white/80 max-w-5xl mx-auto whitespace-nowrap">
              {t.sections.aiAssistants.subtitle}
            </p>
          </div>

          {/* AI Role Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 rounded-[1600px] p-1 shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1)]">
              <div className="relative flex">
                {(['brandOwner', 'supplyChain', 'carbonExpert'] as const).map((role, index) => (
                  <button
                    key={role}
                    onClick={() => setActiveAIRole(role)}
                    className={`relative px-8 py-3 text-lg font-normal tracking-[-0.18px] leading-[23.4px] transition-all duration-300 ${
                      activeAIRole === role
                        ? 'bg-[#6161ff] text-white rounded-[1600px]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {t.sections.personas[role].title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Assistant Cards - ExpandableCards */}
          <ExpandableCards 
            items={getCardsForRole(activeAIRole)} 
            className="mt-8"
          />

          {/* Bottom Action Buttons */}
          <div className="flex justify-center gap-6 mt-8">
            <a href="#contact" className="bg-white rounded-[160px] px-8 py-4 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg">
              <span className="text-black text-lg font-medium">{t.sections.aiAssistants.getStarted}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </a>
            <Link href="/resources" className="border-2 border-white text-white rounded-[160px] px-8 py-4 hover:bg-white hover:text-[rgb(0,52,50)] transition-all">
              <span className="text-lg font-medium">{t.sections.aiAssistants.trustCenter}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Monday.com Difference Section */}
      <section className="relative bg-[rgb(0,52,50)] py-8 overflow-hidden">
        
        {/* Mobile Version - 2x2 Grid with Animal Cards */}
        <div className="block md:hidden px-4">
          {/* Mobile Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              {t.sections.difference.title}
            </h2>
          </div>

          {/* Mobile 2x2 Grid Cards with Animals */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1 - Flexible (Faster Beaver) */}
            <div 
              className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                activeMobileCard === 0 
                  ? 'col-span-2 h-48' 
                  : 'h-36'
              }`}
              onClick={() => setActiveMobileCard(activeMobileCard === 0 ? -1 : 0)}
            >
              {/* Collapsed State - Animal Photo */}
              {activeMobileCard !== 0 && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'url(/faster-beaver.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 40%'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              )}
              
              {/* Expanded State - Colored Background + Text */}
              {activeMobileCard === 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700" />
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-white font-semibold leading-tight ${
                    activeMobileCard === 0 ? 'text-sm' : 'text-xs'
                  }`}>
                    {t.sections.difference.cards.flexible.title}
                  </h3>
                  <span className="text-white/60 text-xs">
                    {activeMobileCard === 0 
                      ? (language === 'zh' ? '点击缩小' : 'Tap to close')
                      : (language === 'zh' ? '点击放大' : 'Tap to expand')
                    }
                  </span>
                </div>
                {activeMobileCard === 0 && (
                  <p className="text-white/90 text-xs leading-relaxed">
                    {t.sections.difference.cards.flexible.description}
                  </p>
                )}
              </div>
            </div>

            {/* Card 2 - Products (Credible Meerkat) */}
            <div 
              className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                activeMobileCard === 1 
                  ? 'col-span-2 h-48' 
                  : 'h-36'
              }`}
              onClick={() => setActiveMobileCard(activeMobileCard === 1 ? -1 : 1)}
            >
              {/* Collapsed State - Animal Photo */}
              {activeMobileCard !== 1 && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'url(/credible-meerkat.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              )}
              
              {/* Expanded State - Colored Background + Text */}
              {activeMobileCard === 1 && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-white font-semibold leading-tight ${
                    activeMobileCard === 1 ? 'text-sm' : 'text-xs'
                  }`}>
                    {t.sections.difference.cards.products.title}
                  </h3>
                  <span className="text-white/60 text-xs">
                    {activeMobileCard === 1 
                      ? (language === 'zh' ? '点击缩小' : 'Tap to close')
                      : (language === 'zh' ? '点击放大' : 'Tap to expand')
                    }
                  </span>
                </div>
                {activeMobileCard === 1 && (
                  <p className="text-white/90 text-xs leading-relaxed">
                    {t.sections.difference.cards.products.description}
                  </p>
                )}
              </div>
            </div>

            {/* Card 3 - Fast Value (Frictionless Dog) */}
            <div 
              className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                activeMobileCard === 2 
                  ? 'col-span-2 h-48' 
                  : 'h-36'
              }`}
              onClick={() => setActiveMobileCard(activeMobileCard === 2 ? -1 : 2)}
            >
              {/* Collapsed State - Animal Photo */}
              {activeMobileCard !== 2 && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'url(/frictionless-dog.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
              )}
              
              {/* Expanded State - Colored Background + Text */}
              {activeMobileCard === 2 && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-700" />
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-white font-semibold leading-tight ${
                    activeMobileCard === 2 ? 'text-sm' : 'text-xs'
                  }`}>
                    {t.sections.difference.cards.fastValue.title}
                  </h3>
                  <span className="text-white/60 text-xs">
                    {activeMobileCard === 2 
                      ? (language === 'zh' ? '点击缩小' : 'Tap to close')
                      : (language === 'zh' ? '点击放大' : 'Tap to expand')
                    }
                  </span>
                </div>
                {activeMobileCard === 2 && (
                  <p className="text-white/90 text-xs leading-relaxed">
                    {t.sections.difference.cards.fastValue.description}
                  </p>
                )}
              </div>
            </div>

            {/* Card 4 - Placeholder for 2x2 grid */}
            <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 h-36 flex items-center justify-center">
              <span className="text-white/40 text-xs">More features coming</span>
            </div>
          </div>
        </div>

        {/* Desktop Version - Keep Original Unchanged */}
        <div className="hidden md:block relative w-full max-w-[1200px] mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-2">
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {t.sections.difference.title}
            </motion.h2>
          </div>

          {/* Cards Layout */}
          <div className="relative w-full h-[580px]">
            {/* Flexible yet standardized - Green Card (Top Left) */}
            {/* 灰色背景块 */}
            <motion.div 
              className="absolute w-[280px] h-[165px] top-[40px] left-[35px] rounded-[20px] group cursor-pointer overflow-hidden border-2 border-white/20 ring-1 ring-white/20 animate-float-gentle"
              style={{
                backgroundImage: 'url(/faster-beaver.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.1))"
              }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>
            {/* 绿色卡片 */}
            <motion.div 
              className="absolute w-[756px] h-[165px] top-[40px] left-[375px] rounded-[20px] group cursor-pointer animate-float-gentle-delayed"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              style={{ 
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.2))"
              }}
            >
              <div className="w-[756px] bg-[#f0f3ff] overflow-hidden absolute h-[165px] top-0 left-0 rounded-[20px]">
                <div className="relative w-[762px] h-[161px] top-[2px] -left-1 bg-gradient-to-br from-green-400 to-green-600" />
              </div>
              <div className="absolute inset-0 p-4 flex items-center">
                <div className="w-1/2">
                  <h3 className="text-2xl font-normal text-white mb-2">{t.sections.difference.cards.flexible.title}</h3>
                </div>
                <div className="w-1/2 pl-3">
                  <p className="text-white text-sm leading-relaxed">{t.sections.difference.cards.flexible.description}</p>
                </div>
              </div>
              {/* Green Icon */}
              <div className="absolute top-3 left-3 w-12 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2"></div>
              </div>
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>

            {/* Products teams love to use - Blue Card (Center Right) */}
            {/* 灰色背景块 */}
            <motion.div 
              className="absolute w-[280px] h-[165px] top-[230px] left-[851px] rounded-[20px] group cursor-pointer overflow-hidden border-2 border-white/20 ring-1 ring-white/20 animate-float-gentle-slow"
              style={{
                backgroundImage: 'url(/credible-meerkat.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.1))"
              }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.33, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>
            {/* 蓝色卡片 */}
            <motion.div 
              className="absolute w-[756px] h-[165px] top-[230px] left-[35px] rounded-[20px] group cursor-pointer animate-float-gentle"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              style={{ 
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.2))"
              }}
            >
              <div className="w-[756px] bg-[#f0f3ff] overflow-hidden absolute h-[165px] top-0 left-0 rounded-[20px]">
                <div className="relative w-[762px] h-[161px] top-[2px] -left-1 bg-gradient-to-br from-blue-500 to-blue-700" />
              </div>
              <div className="absolute inset-0 p-4 flex items-center">
                <div className="w-1/2">
                  <p className="text-white text-sm leading-relaxed">{t.sections.difference.cards.products.description}</p>
                </div>
                <div className="w-1/2 pl-3 flex justify-end">
                  <h3 className="text-2xl font-normal text-white mb-2">{t.sections.difference.cards.products.title}</h3>
                </div>
              </div>
              {/* Heart Icon */}
              <div className="absolute top-3 right-3 w-12 h-9 flex items-center justify-center">
                <div className="w-8 h-6 bg-white rounded-t-full transform rotate-45 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2" style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}></div>
              </div>
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>

            {/* Fast time to value - Pink Card (Bottom Left) */}
            {/* 灰色背景块 */}
            <motion.div 
              className="absolute w-[280px] h-[165px] top-[420px] left-[35px] rounded-[20px] group cursor-pointer overflow-hidden border-2 border-white/20 ring-1 ring-white/20 animate-float-gentle-delayed"
              style={{
                backgroundImage: 'url(/frictionless-dog.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.1))"
              }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.51, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>
            {/* 粉色卡片 */}
            <motion.div 
              className="absolute w-[756px] h-[165px] top-[420px] left-[375px] rounded-[20px] group cursor-pointer animate-float-gentle-slow"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.60, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              style={{ 
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.2))"
              }}
            >
              <div className="w-[756px] bg-[#f0f3ff] overflow-hidden absolute h-[165px] top-0 left-0 rounded-[20px]">
                <div className="relative w-[762px] h-[161px] top-[2px] -left-1 bg-gradient-to-br from-pink-400 to-pink-600" />
              </div>
              <div className="absolute inset-0 p-4 flex items-center">
                <div className="w-1/2">
                  <h3 className="text-2xl font-normal text-white mb-2">{t.sections.difference.cards.fastValue.title}</h3>
                </div>
                <div className="w-1/2 pl-3">
                  <p className="text-white text-sm leading-relaxed">{t.sections.difference.cards.fastValue.description}</p>
                </div>
              </div>
              {/* Pink Icon */}
              <div className="absolute top-3 left-3 w-12 h-8">
                <div className="w-9 h-4 bg-pink-300 rounded-full transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2"></div>
                <div className="w-7 h-4 bg-pink-400 rounded-full mt-1 ml-2 transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2"></div>
              </div>
              {/* 光带效果 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[20px]">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out"
                  style={{ transform: "skewX(-45deg)", width: "200%" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Products Section - Stacked Cards */}
      <section id="products" className="relative bg-[rgb(0,52,50)] -mt-px" data-theme="products" data-section="what-we-do" data-category="product">
        {/* Scrolling Text Section */}
        <div className="relative overflow-hidden py-16 bg-[rgb(0,52,50)] -mt-px">
          <div className="whitespace-nowrap">
            {/* First Row - Moving Right */}
            <div className="flex animate-scroll-right text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-cyan-custom opacity-80 mb-4">
              {Array.from({length: 6}, (_, i) => (
                <span key={i} className="mx-4 sm:mx-6 md:mx-8">{t.sections.whatWeDo.scrollingText1}</span>
              ))}
            </div>
            {/* Second Row - Moving Left */}
            <div className="flex animate-scroll-left text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-[#9ef894] opacity-80">
              {Array.from({length: 6}, (_, i) => (
                <span key={i} className="mx-4 sm:mx-6 md:mx-8">{t.sections.whatWeDo.scrollingText2}</span>
              ))}
            </div>
          </div>
          
          {/* Separator Line */}
          <div className="mt-12 mx-auto w-4/5 h-px bg-white opacity-30"></div>
        </div>
      </section>




      {/* Value Section */}
      <section id="value-for-user" className="py-20 bg-[rgb(0,52,50)]" data-theme="value-for-user" data-section="value-overview" data-category="value">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">{t.sections.valueForUser.title}</h2>
          </div>

          {/* Mobile Layout - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto sm:hidden">
            {/* 1% Cost */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-2xl p-3 shadow-xl min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.cost.title}</h3>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-yellow-400 mb-1 transition-colors duration-300">{t.sections.value.cards.cost.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-xs">{t.sections.value.cards.cost.description}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-2xl p-3 shadow-xl min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.time.title}</h3>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-yellow-400 mb-1 transition-colors duration-300">{t.sections.value.cards.time.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-xs">{t.sections.value.cards.time.description}</p>
                </div>
              </div>
            </div>

            {/* Zero Barrier */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-2xl p-3 shadow-xl min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.barrier.title}</h3>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-yellow-400 mb-1 transition-colors duration-300">{t.sections.value.cards.barrier.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-xs">{t.sections.value.cards.barrier.description}</p>
                </div>
              </div>
            </div>

            {/* Trusted */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-2xl p-3 shadow-xl min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.trusted.title}</h3>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-yellow-400 mb-1 transition-colors duration-300">{t.sections.value.cards.trusted.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-xs">{t.sections.value.cards.trusted.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original 1x4 Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto items-end">
            {/* 1% Cost - Card #1 - 15% Increased */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-3xl p-6 sm:p-8 shadow-xl min-h-[216px] sm:min-h-[259px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer animate-float-gentle">
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{t.sections.value.cards.cost.title}</h3>
                <div className="mt-auto">
                  <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.cost.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-sm sm:text-base">{t.sections.value.cards.cost.description}</p>
                </div>
              </div>
            </div>

            {/* Hours - Card #2 - 15% Increased */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-3xl p-6 sm:p-8 shadow-xl min-h-[216px] sm:min-h-[259px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer animate-float-gentle-delayed">
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{t.sections.value.cards.time.title}</h3>
                <div className="mt-auto">
                  <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.time.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-sm sm:text-base">{t.sections.value.cards.time.description}</p>
                </div>
              </div>
            </div>

            {/* Zero Barrier - Card #3 - 20% Increased from 25% reduced base */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-3xl p-6 sm:p-8 shadow-xl min-h-[252px] sm:min-h-[288px] lg:min-h-[350px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer animate-float-gentle-slow">
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{t.sections.value.cards.barrier.title}</h3>
                <div className="mt-auto">
                  <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.barrier.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-sm sm:text-base">{t.sections.value.cards.barrier.description}</p>
                </div>
              </div>
            </div>

            {/* Trusted - Card #4 - 15% Increased */}
            <div className="group bg-[#6366f1] hover:bg-[#5b57f7] rounded-3xl p-6 sm:p-8 shadow-xl min-h-[216px] sm:min-h-[259px] flex flex-col justify-between transition-all duration-300 hover:scale-105 cursor-pointer animate-float-gentle-smooth">
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{t.sections.value.cards.trusted.title}</h3>
                <div className="mt-auto">
                  <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-yellow-400 mb-2 transition-colors duration-300">{t.sections.value.cards.trusted.subtitle}</h4>
                  <p className="text-white group-hover:text-yellow-400 opacity-80 group-hover:opacity-100 transition-all duration-300 text-sm sm:text-base">{t.sections.value.cards.trusted.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="min-h-screen py-12 lg:py-16 bg-[rgb(0,52,50)] -mt-px" data-theme="pricing" data-section="pricing-overview" data-category="conversion">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-6">{t.sections.pricing.title}</h2>
            <p className="text-base sm:text-xl text-white opacity-90 max-w-3xl mx-auto">
              {t.sections.pricing.subtitle}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto gap-6 sm:gap-8">
            {/* Free Plan Card - Wider and Taller */}
            <div className="bg-[#6195fe] backdrop-blur-sm p-3 sm:p-7 rounded-2xl shadow-lg border border-blue-300 flex flex-col justify-between h-[200px] sm:h-[500px] w-full lg:w-1/3 transform lg:scale-105">
              <div>
                <div className="h-2 sm:h-8 mb-1 sm:mb-4"></div>
                <h3 className="text-base sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800 text-center">{t.sections.pricing.plans.free.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-2 sm:mb-4">{t.sections.pricing.plans.free.description}</p>
                <div className="mb-2 sm:mb-6 text-center">
                  <span className="text-xl sm:text-4xl font-bold text-gray-800">{t.sections.pricing.plans.free.price}</span>
                  <span className="text-gray-600 text-xs sm:text-base">/month</span>
                </div>
                <div className="min-h-[35px] sm:min-h-[120px]">
                  <ul className="space-y-0.5 sm:space-y-3 text-gray-700 text-xs sm:text-sm">
                    {t.sections.pricing.plans.free.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a 
                href="#contact"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1 sm:py-3 rounded-lg font-semibold transition duration-300 text-xs sm:text-base text-center block"
              >
                {t.sections.pricing.plans.free.button}
              </a>
            </div>

            {/* Standard Plan Card - Narrower */}
            <div className="bg-[#9ef894] backdrop-blur-sm p-4 sm:p-9 rounded-2xl shadow-xl transform lg:scale-105 border border-[#8ee884] flex flex-col justify-between h-[200px] sm:h-[500px] w-full lg:w-1/3">
              <div>
                <div className="h-2 sm:h-8 mb-1 sm:mb-4"></div>
                <h3 className="text-base sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800 text-center">{t.sections.pricing.plans.standard.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-2 sm:mb-4">{t.sections.pricing.plans.standard.description}</p>
                <div className="mb-2 sm:mb-6 text-center">
                  <span className="text-xl sm:text-4xl font-bold text-gray-800">{t.sections.pricing.plans.standard.price}</span>
                  <span className="text-gray-600 text-xs sm:text-base">/report</span>
                </div>
                <div className="min-h-[35px] sm:min-h-[120px]">
                  <ul className="space-y-0.5 sm:space-y-3 text-gray-700 text-xs sm:text-sm">
                    {t.sections.pricing.plans.standard.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a 
                href="#contact"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1 sm:py-3 rounded-lg font-semibold transition duration-300 text-xs sm:text-base text-center block"
              >
                {t.sections.pricing.plans.standard.button}
              </a>
            </div>

            {/* Enterprise Plan Card - Wider and Taller */}
            <div className="bg-[#98a2f8] backdrop-blur-sm p-3 sm:p-7 rounded-2xl shadow-lg border border-purple-300 flex flex-col justify-between h-[200px] sm:h-[500px] w-full lg:w-1/3 transform lg:scale-105">
              <div>
                <div className="h-2 sm:h-8 mb-1 sm:mb-4"></div>
                <h3 className="text-base sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800 text-center">{t.sections.pricing.plans.enterprise.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-2 sm:mb-4">{t.sections.pricing.plans.enterprise.description}</p>
                <div className="mb-2 sm:mb-6 text-center">
                  <span className="text-xl sm:text-4xl font-bold text-gray-800">{t.sections.pricing.plans.enterprise.price}</span>
                </div>
                <div className="min-h-[35px] sm:min-h-[120px]">
                  <ul className="space-y-0.5 sm:space-y-3 text-gray-700 text-xs sm:text-sm">
                    {t.sections.pricing.plans.enterprise.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a 
                href="#contact"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1 sm:py-3 rounded-lg font-semibold transition duration-300 text-xs sm:text-base text-center block"
              >
                {t.sections.pricing.plans.enterprise.button}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* White Separator Line */}
      <div className="bg-[rgb(0,52,50)] py-6 lg:py-8">
        <div className="mx-auto w-4/5 h-px bg-white opacity-30"></div>
      </div>

      {/* About Section */}
      <section id="about" className="bg-[rgb(0,52,50)] py-8 lg:py-16" data-theme="about" data-section="about-main" data-category="info">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center min-h-[280px] sm:min-h-[350px] md:min-h-[420px]">
            {/* Left side - Polar Bear Image */}
            <div className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-2xl overflow-hidden lg:pl-40 order-2 lg:order-1" style={{transform: 'translateY(0cm)'}}>
              <Image
                src="/polar-bears.png"
                alt="Polar Bears on Ice"
                fill
                className="object-cover object-center"
                quality={100}
                unoptimized={true}
              />
            </div>
            
            {/* Right side - Content */}
            <div className="text-white flex flex-col justify-center h-full order-1 lg:order-2" style={{transform: 'translateY(0cm)'}}>
              {/* Centered content */}
              <div className="text-center space-y-8 sm:space-y-10 md:space-y-12">
                {/* About Us title - centered */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t.sections.aboutUs.title}</h2>
                </div>
                
                {/* First section - centered */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                    {t.sections.aboutUs.subtitle1}
                  </h3>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                    {t.sections.aboutUs.subtitle2}
                  </h3>
                </div>
                
                {/* White Divider Line */}
                <div className="flex justify-center py-4">
                  <svg width="300" height="12" viewBox="0 0 300 12" className="text-white">
                    <path 
                      d="M3 8 Q75 2 150 6 Q225 10 297 4" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path 
                      d="M8 10 Q82 4 157 8 Q232 12 292 6" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                </div>
                
                {/* Second section - centered with green highlight */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                    {t.sections.aboutUs.subtitle3}
                  </h3>
                  <div className="relative inline-block">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#9ef894] leading-tight">
                      {t.sections.aboutUs.highlightText}
                    </h3>
                    {/* Hand-drawn style underline */}
                    <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-0 right-0 flex justify-center">
                      <svg width="150" height="8" viewBox="0 0 200 12" className="text-[#9ef894] sm:w-[180px] sm:h-[10px] md:w-[400px] md:h-[12px]">
                        <path 
                          d="M2 8 Q50 2 100 6 Q150 10 198 4" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path 
                          d="M5 10 Q55 4 105 8 Q155 12 195 6" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="bg-[rgb(0,52,50)] py-1">
        <div className="flex justify-center">
          <svg width="300" height="12" viewBox="0 0 300 12" className="text-[#9ef894]">
            <path 
              d="M3 8 Q75 2 150 6 Q225 10 297 4" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d="M8 10 Q82 4 157 8 Q232 12 292 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-10 bg-[rgb(0,52,50)] text-white" data-theme="contact" data-section="contact-form" data-category="conversion">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-4">{t.contact.title}</h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              {t.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-3">
                <div className="flex items-center">
                  <span className="text-xl sm:text-2xl mr-3 sm:mr-4">📧</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Email</h4>
                    <p className="opacity-80 text-sm sm:text-base">xuguang.ma@climateseal.net</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xl sm:text-2xl mr-3 sm:mr-4">📞</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Phone</h4>
                    <p className="opacity-80 text-sm sm:text-base">+86 15652618365</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xl sm:text-2xl mr-3 sm:mr-4">🏢</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Location</h4>
                    <p className="opacity-80 text-sm sm:text-base">Beijing, Germany, Dubai, Singapore</p>
                  </div>
                </div>
                
                {/* New Contact Logo */}
<div className="mt-6 sm:mt-4 pt-4 sm:pt-3">
  <div className="flex justify-start">
    <Image
      src="/new-contact-logo.png"
      alt="Climate Seal Contact Logo"
      width={280}
      height={84}
      className="object-contain w-full max-w-[210px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px]"
      unoptimized={true}
      style={{
        clipPath: 'inset(0 0.5% 2% 0)'
      }}
    />
  </div>
</div>
              </div>
            </div>

            <div className="bg-[#98a2f8] bg-opacity-90 p-4 sm:p-6 rounded-2xl backdrop-blur-sm self-start order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-1.5" data-form="contact-form" data-section="contact-form">
                {/* 姓名和邮箱 - 两栏布局 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.name}*</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder={t.contact.form.placeholder.name}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.email}*</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder={t.contact.form.placeholder.email}
                      required
                    />
                  </div>
                </div>
                {/* 电话和公司 - 两栏布局 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.phone}*</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder={t.contact.form.placeholder.phone}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.company}*</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder={t.contact.form.placeholder.company}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.industry || '行业'}*</label>
                  <select 
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm max-h-32 overflow-y-auto"
                    required
                  >
                    <option value="">{t.contact.form.placeholder?.industry || '请选择您的行业'}</option>
                    <option value="automotive">{t.contact.form.industries?.automotive || '汽车制造业'}</option>
                    <option value="electronics">{t.contact.form.industries?.electronics || '电子电器'}</option>
                    <option value="textiles">{t.contact.form.industries?.textiles || '纺织服装'}</option>
                    <option value="chemicals">{t.contact.form.industries?.chemicals || '化工化学'}</option>
                    <option value="food-beverage">{t.contact.form.industries?.foodBeverage || '食品饮料'}</option>
                    <option value="construction">{t.contact.form.industries?.construction || '建筑建材'}</option>
                    <option value="metals">{t.contact.form.industries?.metals || '钢铁金属'}</option>
                    <option value="plastics">{t.contact.form.industries?.plastics || '塑料橡胶'}</option>
                    <option value="packaging">{t.contact.form.industries?.packaging || '包装印刷'}</option>
                    <option value="pharmaceuticals">{t.contact.form.industries?.pharmaceuticals || '医药医疗'}</option>
                    <option value="energy">{t.contact.form.industries?.energy || '能源电力'}</option>
                    <option value="manufacturing">{t.contact.form.industries?.manufacturing || '机械制造'}</option>
                    <option value="furniture">{t.contact.form.industries?.furniture || '家具家居'}</option>
                    <option value="cosmetics">{t.contact.form.industries?.cosmetics || '美妆个护'}</option>
                    <option value="toys">{t.contact.form.industries?.toys || '玩具用品'}</option>
                    <option value="agriculture">{t.contact.form.industries?.agriculture || '农业食品'}</option>
                    <option value="transportation">{t.contact.form.industries?.transportation || '交通运输'}</option>
                    <option value="retail">{t.contact.form.industries?.retail || '零售贸易'}</option>
                    <option value="other">{t.contact.form.industries?.other || '其他'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-black">{t.contact.form.message}*</label>
                  <textarea 
                    rows={1}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 rounded-lg bg-white bg-opacity-90 border border-white border-opacity-50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-sm"
                    placeholder={t.contact.form.placeholder.message}
                    required
                  ></textarea>
                </div>
                
                {submitMessage && (
                  <div className={`text-sm p-2 rounded-lg ${
                    submitMessage.includes('成功') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-1.5 sm:py-2 rounded-lg font-semibold transition duration-300 text-center text-sm ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                      : 'bg-yellow-400 hover:bg-yellow-500 text-[rgb(0,52,50)]'
                  }`}
                >
                  {isSubmitting ? t.contact.form.submitting : t.contact.form.submit}
                </button>
                
                {/* Privacy Disclaimer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t.contact.form.privacyDisclaimer}{' '}
                    <Link 
                      href="/privacy" 
                      className="text-[rgb(0,52,50)] underline hover:text-[rgb(0,42,40)] transition-colors"
                    >
                      {language === 'zh' ? '隐私政策' : 'Privacy Policy'}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Page-level footer removed: using global Footer component instead */}
    </div>
    </>
  );
}