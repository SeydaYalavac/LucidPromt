"use client";

import { useState } from "react";
import { CreateThreadModal } from "./CreateThreadModal";
import { useRouter } from "next/navigation";

export function CreateThreadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    // Optionally refresh the page or show a toast
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
      >
        Yeni Konu Aç
      </button>
      <CreateThreadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
