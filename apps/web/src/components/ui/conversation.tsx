'use client';

import type { ComponentProps, HTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConversationProps = HTMLAttributes<HTMLDivElement>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <div
    className={cn('relative flex-1 overflow-y-auto', className)}
    role="log"
    {...props}
  />
);

export type ConversationContentProps = HTMLAttributes<HTMLDivElement>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <div className={cn('p-4', className)} {...props} />
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => (
  <Button
    className={cn(
      'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
      className,
    )}
    size="icon"
    type="button"
    variant="outline"
    {...props}
  >
    <ArrowDownIcon className="size-4" />
  </Button>
);
