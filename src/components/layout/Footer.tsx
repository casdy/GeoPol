'use client';

import React, { useState } from 'react';
import { Radar, Twitter, Linkedin, Github, Shield, Info } from 'lucide-react';
import NewsletterForm from '@/components/shared/NewsletterForm';
import TopicModal from '@/components/dashboard/TopicModal';

const footerSections = [
  {
    title: 'World',
    links: ['Africa', 'Americas', 'Asia', 'Australia', 'China', 'Europe', 'India', 'Middle East', 'United Kingdom'],
  },
  {
    title: 'US Politics',
    links: ['Trump', 'Facts First', 'CNN Polls', '2026 Elections Calendar', 'Redistricting Tracker', 'Epstein Files'],
  },
  {
    title: 'Business',
    links: ['Tech', 'Media', 'Calculators', 'Videos'],
  },
  {
    title: 'Markets',
    links: ['Pre-markets', 'After-Hours', 'Fear & Greed', 'Investing', 'Markets Now', 'Nightcap'],
  },
  {
    title: 'Health',
    links: ['Life, But Better', 'Fitness', 'Food', 'Sleep', 'Mindfulness', 'Relationships'],
  },
  {
    title: 'Entertainment',
    links: ['Movies', 'Television', 'Celebrity'],
  },
  {
    title: 'Tech',
    links: ['Innovate'],
  },
  {
    title: 'Style',
    links: ['Arts', 'Design', 'Fashion', 'Architecture', 'Luxury', 'Beauty', 'Video'],
  },
  {
    title: 'Travel',
    links: ['Destinations', 'Food & Drink', 'Stay', 'News', 'Videos'],
  },
  {
    title: 'Sports',
    links: ['Football', 'Tennis', 'Golf', 'Motorsport', 'US Sports', 'Olympics'],
  },
  {
    title: 'Science',
    links: ['Space', 'Life', 'Unearthed'],
  },
  {
    title: 'Climate',
    links: ['Solutions', 'Weather'],
  },
  {
    title: 'Weather',
    links: ['Video', 'Climate'],
  },
  {
    title: 'Winter Olympics 2026',
    links: [],
  },
  {
    title: 'Ukraine-Russia War',
    links: [],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <footer className="w-full bg-[#0E0E0E] text-white border-t border-neutral-900 pt-16 pb-8 mt-12 font-sans relative">
      <TopicModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
      <div className="mx-auto px-4 lg:px-8 xl:px-12">
        {/* Mega Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8 mb-16">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className="font-bold text-base mb-4 tracking-tight">
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedTopic(section.title); }}
                  className="hover:underline hover:text-orange-500 transition-colors text-left"
                >
                  {section.title}
                </button>
              </h3>
              {section.links.length > 0 && (
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button 
                        onClick={(e) => { e.preventDefault(); setSelectedTopic(link); }}
                        className="text-neutral-300 hover:text-white hover:underline transition-all text-sm tracking-tight text-left"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Branding & Newsletter Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-t border-neutral-800 pt-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <Radar className="w-6 h-6 text-orange-500" />
                <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-ping" />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter text-white">
                GEO<span className="text-orange-500">POL</span>
              </h2>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed font-mono">
              INTELLIGENCE TERMINAL V4.2 <br />
              GLOBAL SURVEILLANCE & STRATEGIC ANALYSIS
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="w-full lg:w-[480px] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Strategic Comms
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              SECURE YOUR INTEL. RECEIVE CRITICAL UPDATES DIRECTLY.
            </p>
            {/* Using the minimal form implementation you requested earlier */}
            <NewsletterForm variant="minimal" />
          </div>
        </div>

        {/* Legal & Versioning */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-neutral-600">
            <p>© {currentYear} GEO POL INC.</p>
            <p className="flex items-center gap-1.5 border-l border-neutral-800 pl-6">
              <Shield className="w-3 h-3" /> SECURE LINK
            </p>
          </div>
          <div className="flex items-center gap-5 flex-wrap text-[10px] uppercase font-black tracking-[0.2em] text-neutral-600">
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">System Terms</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Data Ethics</a>
            <a href="#" className="hover:text-neutral-400 transition-colors flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Terminal V4.2.0
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
