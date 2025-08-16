import React, { useEffect, useRef } from "react";
import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const exportToCSV = () => {
    const rows = [
      ["id", "sender", "content"],
      ...messages.map((m) => [
        m.id,
        m.sender === MessageSender.AVATAR ? "Avatar" : "You",
        m.content.replace(/,/g, ""), // avoid CSV commas messing things up
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="w-[600px] overflow-y-auto flex flex-col gap-2 px-2 py-2 text-white self-center max-h-[150px]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-1 max-w-[350px] ${
              message.sender === MessageSender.CLIENT
                ? "self-end items-end"
                : "self-start items-start"
            }`}
          >
            <p className="text-xs text-zinc-400">
              {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
            </p>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>

      <button
        onClick={exportToCSV}
        className="bg-blue-600 text-white px-3 py-1 rounded-md self-center"
      >
        Export Chat
      </button>
    </div>
  );
};
