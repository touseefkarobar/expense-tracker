"use client";

import { useEffect, useState } from "react";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
}

let listeners: ((toast: ToastMessage) => void)[] = [];

export function useToast() {
  return (toast: Omit<ToastMessage, "id">) => {
    const payload: ToastMessage = { id: Date.now(), ...toast };
    listeners.forEach(listener => listener(payload));
  };
}

export function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setMessages(current => [...current, toast]);
      setTimeout(() => {
        setMessages(current => current.filter(item => item.id !== toast.id));
      }, 3000);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter(item => item !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex max-w-sm flex-col gap-2">
      {messages.map(message => (
        <div key={message.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-lg">
          <p className="font-semibold">{message.title}</p>
          {message.description ? (
            <p className="text-sm text-slate-600">{message.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
