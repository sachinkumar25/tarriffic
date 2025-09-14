'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, X } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/globe', label: 'Interactive World Map', icon: '🌍' },
    { href: '/heatmap', label: 'Global Heatmap', icon: '🗺️' },
    { href: '/sectors', label: 'Sector Breakdown', icon: '📊' },
    { href: '/basket', label: 'Consumer Basket', icon: '🛒' },
];

export default function DynamicDock() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="fixed top-6 right-6 z-50">
            <div className="relative">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all text-white hover:text-sky-300"
                    title={isOpen ? "Close Navigation" : "Open Navigation"}
                >
                    {isOpen ? <X size={20} /> : <LayoutGrid size={20} />}
                </button>

                {/* Navigation Menu */}
                {isOpen && (
                    <div 
                        className="absolute top-full right-0 mt-3 w-48 bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20
                                   origin-top-right transition-all duration-300 ease-in-out
                                   transform opacity-100 scale-100"
                        style={{
                            // A simple animation
                            animation: 'fadeInScaleUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards'
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map(({ href, label, icon }) => (
                                <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                                    <div
                                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                            pathname === href
                                                ? 'bg-sky-500/40 text-white font-semibold'
                                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-lg">{icon}</span>
                                        <span className="font-medium">{label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
