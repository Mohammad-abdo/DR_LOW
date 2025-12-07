import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
  containerRef: null,
});

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (value) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const containerRef = React.useRef(null);
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, containerRef }}>
      <div ref={containerRef} className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, asChild = false, children, ...props }, ref) => {
    const { open, setOpen, containerRef } = React.useContext(DropdownMenuContext);
    const triggerRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (!open) return;
        
        // Check if click is outside the dropdown container
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setOpen(false);
        }
      };

      if (open) {
        // Use setTimeout to avoid immediate closure
        setTimeout(() => {
          document.addEventListener("mousedown", handleClickOutside);
        }, 0);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open, setOpen]);

    const handleClick = () => {
      setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: triggerRef,
        onClick: handleClick,
        ...props,
      });
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        className={cn("", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "end", sideOffset = 4, forceMount, ...props }, ref) => {
    const { open } = React.useContext(DropdownMenuContext);

    if (!open && !forceMount) return null;

    // Remove forceMount from props to avoid React warning
    const { forceMount: _, ...restProps } = props;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
          align === "end" && "right-0",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          className
        )}
        style={{ marginTop: `${sideOffset}px` }}
        {...restProps}
      />
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e) => {
      props.onClick?.(e);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuGroup = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const DropdownMenuPortal = ({ children }) => children;

const DropdownMenuSub = ({ children }) => children;

const DropdownMenuSubContent = ({ children }) => children;

const DropdownMenuSubTrigger = ({ children }) => children;

const DropdownMenuRadioGroup = ({ children }) => children;

const DropdownMenuCheckboxItem = ({ children }) => children;

const DropdownMenuRadioItem = ({ children }) => children;

const DropdownMenuShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
