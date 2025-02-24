'use client';

// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Learning',
      links: [
        { name: 'Activities', href: '/activities' },
        { name: 'Voice Chat', href: '/realtime-voice' },
        { name: 'Resources', href: '/resources' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact', href: '/contact' },
        { name: 'Feedback', href: '/feedback' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Inversity
            </Link>
            <p className="text-sm text-gray-500">
              Making mathematics intuitive and engaging through interactive
              learning experiences.
            </p>
          </div>

          {/* Links section */}
          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-900">
                  {section.title}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright section */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500 xl:text-center">
            &copy; {currentYear} Inversity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
