'use client';
import { cn } from '@/lib/utils';
import React from 'react';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
    return (
        <div
            className={cn('min-h-screen w-full bg-background', className)}
            style={{
                backgroundImage: `radial-gradient(circle, var(--dot-color, #e5e7eb) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
            }}
            {...props}
        />
    );
}
