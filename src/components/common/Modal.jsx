import { X } from "lucide-react";

export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h3
            className="font-bold text-[15px]"
            style={{ fontFamily: "inherit" }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}