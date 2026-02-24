"use client";

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
    text: string;
    className?: string;
    wordClassName?: string;
    baseDelay?: number;
    wordDelay?: number;
}

export function AnimatedText({
    text,
    className,
    wordClassName,
    baseDelay = 0,
    wordDelay = 150
}: AnimatedTextProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        const animateWords = () => {
            const wordElements = document.querySelectorAll('.word-animate');
            wordElements.forEach(word => {
                const delay = parseInt(word.getAttribute('data-delay') || '0');
                setTimeout(() => {
                    if (word) (word as HTMLElement).style.animation = 'word-appear 0.8s ease-out forwards';
                }, delay);
            });
        };
        const timeoutId = setTimeout(animateWords, 100);
        return () => clearTimeout(timeoutId);
    }, [isClient, text]);

    useEffect(() => {
        if (!isClient) return;
        const wordElements = document.querySelectorAll('.word-animate');
        const handleMouseEnter = (e: Event) => {
            if (e.target) (e.target as HTMLElement).style.textShadow = '0 0 20px rgba(203, 213, 225, 0.5)';
        };
        const handleMouseLeave = (e: Event) => {
            if (e.target) (e.target as HTMLElement).style.textShadow = 'none';
        };
        wordElements.forEach(word => {
            word.addEventListener('mouseenter', handleMouseEnter);
            word.addEventListener('mouseleave', handleMouseLeave);
        });
        return () => {
            wordElements.forEach(word => {
                if (word) {
                    word.removeEventListener('mouseenter', handleMouseEnter);
                    word.removeEventListener('mouseleave', handleMouseLeave);
                }
            });
        };
    }, [isClient, text]);

    if (!isClient) {
        return <span className={className}>{text}</span>;
    }

    const words = text.split(" ");

    return (
        <span className={cn("inline-block text-decoration-animate", className)}>
            <style>{`
        @keyframes word-appear { 
          0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); } 
          50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); } 
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
        }
        .word-animate { 
          display: inline-block; 
          opacity: 0; 
          margin: 0 0.1em; 
          transition: color 0.3s ease, transform 0.3s ease; 
        }
        .word-animate:hover { 
          color: #cbd5e1; /* slate-300 */ 
          transform: translateY(-2px); 
        }
      `}</style>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={cn("word-animate", wordClassName)}
                    data-delay={baseDelay + (i * wordDelay)}
                >
                    {word}&nbsp;
                </span>
            ))}
        </span>
    );
}
