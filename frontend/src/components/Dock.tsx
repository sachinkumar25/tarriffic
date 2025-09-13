'use client'

import React from 'react';
import Link from 'next/link';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/heatmap', label: 'Global Heatmap' },
    { href: '/sectors', label: 'Sector Breakdown' },
];

export default function Dock() {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
                {navLinks.map(({ href, label }) => (
                    <Link key={href} href={href}>
                        <p className="px-4 py-2 text-sm text-white rounded-full hover:bg-white/20 transition-colors duration-300 ease-in-out cursor-pointer">
                            {label}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
