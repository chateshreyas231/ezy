"use client";

import { Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

type MenuOption = "Auto" | "Max" | "Search" | "Plan";

type ChatInputProps = {
  placeholder?: string;
  onSubmit?: (value: string, modes: MenuOption[]) => void;
  disabled?: boolean;
  glowIntensity?: number;
  expandOnFocus?: boolean;
  animationDuration?: number;
  textColor?: string;
  backgroundOpacity?: number;
  showEffects?: boolean;
  menuOptions?: MenuOption[];
  floating?: boolean;
};

type RippleEffect = { x: number; y: number; id: number };

const SendButton = memo(({ disabled }: { disabled: boolean }) => (
  <button
    type="submit"
    aria-label="Send"
    disabled={disabled}
    className={`ml-auto h-8 w-8 rounded-full flex items-center justify-center transition ${
      disabled ? "opacity-40 cursor-not-allowed bg-gray-400 text-white/70" : "bg-[#0A1217] text-white hover:opacity-90"
    }`}
  >
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 22L16 10M16 10L11 15M16 10L21 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </button>
));
SendButton.displayName = "SendButton";

export default function PromptInputDynamicGrow({
  placeholder = "Ask AI to find the best match...",
  onSubmit,
  disabled = false,
  glowIntensity = 0.4,
  expandOnFocus = true,
  animationDuration = 500,
  textColor = "#0A1217",
  backgroundOpacity = 0.15,
  showEffects = true,
  menuOptions = ["Auto", "Max", "Search", "Plan"],
  floating = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const maxHeight = 22 * 4 + 16;
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
  }, [value]);

  const addRipple = useCallback((x: number, y: number) => {
    if (!showEffects) return;
    const ripple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev.slice(-3), ripple]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((item) => item.id !== ripple.id));
    }, 600);
  }, [showEffects]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !showEffects) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [showEffects]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top);
  }, [addRipple]);

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit?.(value.trim(), selectedOptions);
    setValue("");
  }, [disabled, onSubmit, selectedOptions, value]);

  const keyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      submit(fakeEvent);
    }
  }, [submit]);

  const baseWidth = selectedOptions.length > 0 ? "w-[30rem]" : "w-[18rem]";
  const focusWidth = expandOnFocus && selectedOptions.length === 0 ? "focus-within:w-[30rem]" : "";
  const submitDisabled = disabled || !value.trim();

  const rootStyle = useMemo(
    () => ({
      transition: `width ${animationDuration}ms ease, transform ${animationDuration}ms ease`,
    }),
    [animationDuration],
  );

  const surfaceStyle = useMemo(
    () => ({
      color: textColor,
      backgroundColor: `rgba(255,255,255,${backgroundOpacity})`,
      boxShadow: `0 6px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(147,51,234,${0.18 * glowIntensity})`,
    }),
    [backgroundOpacity, glowIntensity, textColor],
  );

  const formClass = floating
    ? `sticky bottom-4 left-1/2 -translate-x-1/2 z-40 ${baseWidth} ${focusWidth}`
    : `mx-auto w-full max-w-[30rem] ${baseWidth} ${focusWidth}`;

  return (
    <form onSubmit={submit} className={formClass} style={rootStyle}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="relative rounded-3xl p-2 backdrop-blur-xl border border-primary/20 overflow-visible"
        style={surfaceStyle}
      >
        {showEffects && (
          <>
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, rgba(147,51,234,0.10), transparent 70%)`,
              }}
            />
            {ripples.map((r) => (
              <div key={r.id} className="absolute pointer-events-none" style={{ left: r.x - 20, top: r.y - 20 }}>
                <div className="h-10 w-10 rounded-full bg-purple-400/20 animate-ping" />
              </div>
            ))}
          </>
        )}

        <div className="relative z-10 flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-30 min-w-[120px] py-1">
                {menuOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      setSelectedOptions((prev) => (prev.includes(option) ? prev : [...prev, option]));
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center">
            <textarea
              suppressHydrationWarning
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={keyDown}
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              className="w-full min-h-8 max-h-24 resize-none bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground px-2"
            />
            <SendButton disabled={submitDisabled} />
          </div>
        </div>

        {selectedOptions.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2 mt-2 px-1">
            {selectedOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setSelectedOptions((prev) => prev.filter((o) => o !== option))}
                className="text-xs rounded-md border bg-primary/10 px-2 py-1 hover:bg-primary/20"
              >
                {option} ×
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
