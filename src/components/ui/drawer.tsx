import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Drawer({ open, onOpenChange, children }: any) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full md:max-w-md bg-white shadow-lg p-6 overflow-y-auto">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DrawerHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);

export const DrawerTitle = ({ children }: any) => (
  <h2 className="text-2xl font-bold">{children}</h2>
);

export const DrawerClose = ({ ...props }: any) => (
  <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" {...props}>
    <X />
  </button>
);

export const DrawerContent = ({ children, className }: any) => (
  <div className={className}>{children}</div>
);
