import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

function HintsAccordion({ hints }: { hints: string[] }) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    const newSet = new Set(openIndexes);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setOpenIndexes(newSet);
  };

  return (
    <div className="space-y-2 mt-4">
      <h4 className="font-semibold text-lg mb-2">Hints</h4>
      {hints.map((hint, i) => {
        const isOpen = openIndexes.has(i);
        return (
          <div key={i} className="border border-gray-700 rounded">
            <button
              onClick={() => toggle(i)}
              className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 focus:outline-none"
            >
              <span className="font-semibold text-gray-200">Hint {i + 1}</span>
              {isOpen ? (
                <ChevronDownIcon className="w-5 h-5 text-purple-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-purple-400" />
              )}
            </button>
            {isOpen && (
              <div className="p-4 bg-gray-900 text-gray-300 text-sm whitespace-pre-line">
                {hint}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HintsAccordion;