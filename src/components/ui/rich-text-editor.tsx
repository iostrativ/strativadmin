import * as React from "react";
import { useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus,
  Plus,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
}

const FONT_SIZES = [
  { value: "10", label: "10px" },
  { value: "13", label: "13px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
  { value: "24", label: "24px" },
  { value: "32", label: "32px" },
  { value: "48", label: "48px" },
];

const FONT_FAMILIES = [
  { value: "inherit", label: "Default" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Impact, sans-serif", label: "Impact" },
];

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, tooltip, children }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value = "", onChange, placeholder, className, minHeight = "150px", disabled = false }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChange = useRef(false);
    const [activeFormats, setActiveFormats] = React.useState<Record<string, boolean>>({});
    const [currentFontSize, setCurrentFontSize] = React.useState("16");
    const [currentFontFamily, setCurrentFontFamily] = React.useState("inherit");
    const [currentFontColor, setCurrentFontColor] = React.useState("#000000");

    // Initialize content
    useEffect(() => {
      if (editorRef.current && !isInternalChange.current) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || "";
        }
      }
      isInternalChange.current = false;
    }, [value]);

    // Handle input changes
    const handleInput = useCallback(() => {
      if (editorRef.current && onChange) {
        isInternalChange.current = true;
        const html = editorRef.current.innerHTML;
        // Convert empty editor to empty string
        const cleanHtml = html === "<br>" || html === "<div><br></div>" ? "" : html;
        onChange(cleanHtml);
      }
    }, [onChange]);

    // Apply inline style to selection using CSS
    const applyStyle = useCallback((styleProperty: string, styleValue: string) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) return; // No selection
      
      editorRef.current?.focus();
      
      // Create a span with the style
      const span = document.createElement("span");
      span.style.setProperty(styleProperty, styleValue);
      
      // Extract and wrap the selected content
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
      
      // Clean up: select the new span content
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
      
      handleInput();
    }, [handleInput]);

    // Execute formatting command
    const execCommand = useCallback((command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      updateActiveFormats();
      handleInput();
    }, [handleInput]);

    // Update active format states based on current selection
    const updateActiveFormats = useCallback(() => {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });

      // Try to detect current font size from selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        if (node) {
          const element = node.nodeType === Node.ELEMENT_NODE 
            ? node as HTMLElement 
            : node.parentElement;
          if (element) {
            const computedStyle = window.getComputedStyle(element);
            const fontSize = parseInt(computedStyle.fontSize);
            if (fontSize) {
              setCurrentFontSize(String(fontSize));
            }
            const fontFamily = computedStyle.fontFamily;
            if (fontFamily && fontFamily !== "inherit") {
              setCurrentFontFamily(fontFamily.split(",")[0].replace(/['"]/g, "").trim());
            }            // Try to detect current text color
            const color = computedStyle.color;
            if (color) {
              // Convert rgb to hex
              const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
                setCurrentFontColor(`#${r}${g}${b}`);
              }
            }          }
        }
      }
    }, []);

    // Handle selection change
    useEffect(() => {
      const handleSelectionChange = () => {
        if (editorRef.current?.contains(document.activeElement)) {
          updateActiveFormats();
        }
      };

      document.addEventListener("selectionchange", handleSelectionChange);
      return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [updateActiveFormats]);

    // Handle paste to strip formatting if needed
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      // Allow HTML paste but clean it up
      e.preventDefault();
      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      
      if (html) {
        // Insert HTML but let browser handle it
        document.execCommand("insertHTML", false, html);
      } else {
        document.execCommand("insertText", false, text);
      }
      handleInput();
    }, [handleInput]);

    const handleFontSizeChange = (size: string) => {
      setCurrentFontSize(size);
      applyStyle("font-size", `${size}px`);
    };

    const handleFontFamilyChange = (family: string) => {
      setCurrentFontFamily(family);
      if (family !== "inherit") {
        applyStyle("font-family", family);
      }
    };

    const handleFontColorChange = (color: string) => {
      setCurrentFontColor(color);
      applyStyle("color", color);
    };

    const increaseFontSize = () => {
      const currentSize = parseInt(currentFontSize) || 16;
      const sizes = FONT_SIZES.map(s => parseInt(s.value));
      const currentIndex = sizes.findIndex(s => s >= currentSize);
      if (currentIndex < sizes.length - 1) {
        handleFontSizeChange(String(sizes[currentIndex + 1]));
      }
    };

    const decreaseFontSize = () => {
      const currentSize = parseInt(currentFontSize) || 16;
      const sizes = FONT_SIZES.map(s => parseInt(s.value));
      const currentIndex = sizes.findIndex(s => s >= currentSize);
      if (currentIndex > 0) {
        handleFontSizeChange(String(sizes[currentIndex - 1]));
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 p-1">
          {/* Font Family */}
          <Select value={currentFontFamily} onValueChange={handleFontFamilyChange} disabled={disabled}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Font Size */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={decreaseFontSize} disabled={disabled} tooltip="Decrease font size">
              <Minus className="h-3 w-3" />
            </ToolbarButton>
            <Select value={currentFontSize} onValueChange={handleFontSizeChange} disabled={disabled}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToolbarButton onClick={increaseFontSize} disabled={disabled} tooltip="Increase font size">
              <Plus className="h-3 w-3" />
            </ToolbarButton>
          </div>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Font Color */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <input
                  type="color"
                  value={currentFontColor}
                  onChange={(e) => handleFontColorChange(e.target.value)}
                  className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 pointer-events-none"
                  disabled={disabled}
                >
                  <Palette className="h-4 w-4" />
                  <span 
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full"
                    style={{ backgroundColor: currentFontColor }}
                  />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Text Color</p>
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => execCommand("bold")}
            active={activeFormats.bold}
            disabled={disabled}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("italic")}
            active={activeFormats.italic}
            disabled={disabled}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("underline")}
            active={activeFormats.underline}
            disabled={disabled}
            tooltip="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            active={activeFormats.justifyLeft}
            disabled={disabled}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            active={activeFormats.justifyCenter}
            disabled={disabled}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            active={activeFormats.justifyRight}
            disabled={disabled}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyFull")}
            active={activeFormats.justifyFull}
            disabled={disabled}
            tooltip="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            active={activeFormats.insertUnorderedList}
            disabled={disabled}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            active={activeFormats.insertOrderedList}
            disabled={disabled}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none px-3 py-2 text-sm focus:outline-none",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_li]:my-1"
          )}
          style={{ minHeight }}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        {/* Placeholder styles */}
        <style>{`
          [data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
            position: absolute;
          }
          [data-placeholder]:empty {
            position: relative;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
