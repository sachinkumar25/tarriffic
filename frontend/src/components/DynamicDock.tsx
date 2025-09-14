'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Move, Eye, EyeOff } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/heatmap', label: 'Global Heatmap', icon: '🗺️' },
    { href: '/sectors', label: 'Sector Breakdown', icon: '📊' },
    { href: '/basket', label: 'Consumer Basket', icon: '🛒' },
];

export default function DynamicDock() {
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dockRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === dockRef.current || (e.target as HTMLElement).closest('[data-dock-handle]')) {
            e.preventDefault();
            setIsDragging(true);
            // Don't use offset - just track the initial click position
            setDragOffset({
                x: e.clientX,
                y: e.clientY,
            });
        }
    };

    // Handle mouse move for dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            // Calculate movement from initial click position
            const deltaX = e.clientX - dragOffset.x;
            const deltaY = e.clientY - dragOffset.y;
            
            // Convert to percentage and add to current position
            const newX = position.x + (deltaX / window.innerWidth) * 100;
            const newY = position.y + (deltaY / window.innerHeight) * 100;
            
            // Keep dock within viewport bounds
            const clampedX = Math.max(5, Math.min(95, newX));
            const clampedY = Math.max(5, Math.min(95, newY));
            
            setPosition({ x: clampedX, y: clampedY });
            
            // Update drag offset to prevent accumulation
            setDragOffset({ x: e.clientX, y: e.clientY });
        }
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.target === dockRef.current || (e.target as HTMLElement).closest('[data-dock-handle]')) {
            e.preventDefault();
            setIsDragging(true);
            const touch = e.touches[0];
            setDragOffset({
                x: touch.clientX,
                y: touch.clientY,
            });
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            
            // Calculate movement from initial touch position
            const deltaX = touch.clientX - dragOffset.x;
            const deltaY = touch.clientY - dragOffset.y;
            
            // Convert to percentage and add to current position
            const newX = position.x + (deltaX / window.innerWidth) * 100;
            const newY = position.y + (deltaY / window.innerHeight) * 100;
            
            // Keep dock within viewport bounds
            const clampedX = Math.max(5, Math.min(95, newX));
            const clampedY = Math.max(5, Math.min(95, newY));
            
            setPosition({ x: clampedX, y: clampedY });
            
            // Update drag offset to prevent accumulation
            setDragOffset({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Add event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragOffset, position]);

    // Handle window resize to keep dock in bounds
    useEffect(() => {
        const handleResize = () => {
            const clampedX = Math.max(0, Math.min(90, position.x));
            const clampedY = Math.max(0, Math.min(90, position.y));
            setPosition({ x: clampedX, y: clampedY });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [position]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all"
                title="Show Navigation"
            >
                <Eye size={16} className="text-white" />
            </button>
        );
    }

    return (
        <div
            ref={dockRef}
            className={`fixed z-50 transition-all duration-200 ${
                isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-105'
            }`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate3d(-50%, -50%, 0)',
                cursor: isDragging ? 'grabbing' : 'grab',
                willChange: isDragging ? 'transform' : 'auto',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="relative">
                {/* Drag Handle */}
                <div
                    data-dock-handle
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-2 bg-white/15 backdrop-blur-md rounded-full text-xs text-white/80 hover:text-white hover:bg-white/25 transition-all cursor-grab active:cursor-grabbing"
                >
                    <Move size={14} />
                    <span className="font-medium">Drag</span>
                </div>

                {/* Main Dock */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-white/20">
                    {/* Hide Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Hide Navigation"
                    >
                        <EyeOff size={14} className="text-white/70 hover:text-white" />
                    </button>

                    {/* Navigation Links */}
                    {navLinks.map(({ href, label, icon }) => (
                        <Link key={href} href={href}>
                            <div
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                                    pathname === href
                                        ? 'bg-white/30 text-white font-semibold'
                                        : 'text-white/80 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                <span className="text-base">{icon}</span>
                                <span className="hidden sm:inline">{label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
