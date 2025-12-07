import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const SelectContext = React.createContext({
  open: false,
  setOpen: () => {},
  value: "",
  onValueChange: () => {},
  containerRef: null,
  selectedLabel: "",
  setSelectedLabel: () => {},
  itemsRef: null,
});

const Select = ({ value, onValueChange, children, ...props }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || "");
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const containerRef = React.useRef(null);
  const itemsRef = React.useRef(new Map());

  React.useEffect(() => {
    setInternalValue(value || "");
    // Try to find the label for the current value
    if (value && itemsRef.current.has(value)) {
      setSelectedLabel(itemsRef.current.get(value));
    } else if (!value) {
      setSelectedLabel("");
    }
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue, label) => {
      setInternalValue(newValue);
      setSelectedLabel(label || "");
      onValueChange?.(newValue);
      setInternalOpen(false);
    },
    [onValueChange]
  );

  const setOpen = React.useCallback((isOpen) => {
    setInternalOpen(isOpen);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!internalOpen) return;
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setInternalOpen(false);
      }
    };

    if (internalOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [internalOpen]);

  return (
    <SelectContext.Provider
      value={{
        open: internalOpen,
        setOpen,
        value: internalValue,
        onValueChange: handleValueChange,
        containerRef,
        selectedLabel,
        setSelectedLabel,
        itemsRef,
      }}
    >
      <div ref={containerRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, value, onValueChange } = React.useContext(SelectContext);
  const triggerRef = React.useRef(null);

  React.useImperativeHandle(ref, () => triggerRef.current);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, ...props }) => {
  const { value, selectedLabel } = React.useContext(SelectContext);

  return (
    <span className={cn(!selectedLabel && !value && "text-muted-foreground")} {...props}>
      {selectedLabel || placeholder}
    </span>
  );
};
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, containerRef } = React.useContext(SelectContext);
  const contentRef = React.useRef(null);

  React.useImperativeHandle(ref, () => contentRef.current);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 max-h-[300px] overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onValueChange, value: selectedValue, setSelectedLabel, itemsRef } = React.useContext(SelectContext);
  const itemRef = React.useRef(null);

  React.useImperativeHandle(ref, () => itemRef.current);

  const isSelected = selectedValue === value;

  // Extract text content from children
  const getTextContent = (node) => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join("");
    if (node?.props?.children) return getTextContent(node.props.children);
    return "";
  };

  const label = getTextContent(children);

  // Register this item's label
  React.useEffect(() => {
    if (itemsRef && value !== undefined && value !== null) {
      itemsRef.current.set(value, label);
    }
  }, [value, label, itemsRef]);

  const handleClick = () => {
    setSelectedLabel(label);
    onValueChange(value, label);
  };

  return (
    <div
      ref={itemRef}
      data-select-value={value}
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
