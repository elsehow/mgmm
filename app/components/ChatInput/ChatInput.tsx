import { FormEvent, useRef, useEffect } from "react";
import { CSS_CLASSES } from "@/app/config/constants";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled, value]); // Re-focus after value changes

  // Keep focus on the input whenever it loses focus
  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    };

    const handleBlur = () => {
      // Refocus after a short delay to prevent conflicts
      setTimeout(() => {
        if (inputRef.current && !disabled) {
          inputRef.current.focus();
        }
      }, 10);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (input) {
        input.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <div className={CSS_CLASSES.CHAT_FORM}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={CSS_CLASSES.CHAT_INPUT}
        autoFocus
      />
    </div>
  );
}
