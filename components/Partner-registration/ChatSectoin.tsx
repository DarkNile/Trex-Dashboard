// components/UI/Partner-registration/ChatSection.tsx
"use client";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useState } from "react";

const MESSAGE_ON_REGISTRATION = gql`
  mutation MessageOnRegistration($message: String!, $id: Int!) {
    messageOnRegistration(message: $message, id: $id)
  }
`;

interface Message {
  from: string;
  message: string;
}

interface ChatSectionProps {
  readonly registrationId: number;
  readonly initialChat: { messages: Message[] };
  readonly refetchChat: () => void;
}

export default function ChatSection({
  registrationId,
  initialChat,
  refetchChat,
}: Readonly<ChatSectionProps>) {
  const [newMessage, setNewMessage] = useState("");

  const { execute: sendMessage, isLoading: sendingMessage } =
    useGenericMutation({
      mutation: MESSAGE_ON_REGISTRATION,
      onSuccess: () => {
        setNewMessage("");
        refetchChat();
      },
      onError: (error) => {
        console.log("Error sending message:", error);
      },
    });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage({
        message: newMessage.trim(),
        id: registrationId,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Chat History</h2>
      <div className="flex flex-col h-[400px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {initialChat.messages.map((msg: Message, index: number) => (
            <div
              key={index}
              className={`flex ${
                msg.from === "partner" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.from === "partner"
                    ? "bg-gray-100"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p
                  className={`text-sm ${
                    msg.from === "partner" ? "text-gray-600" : "text-blue-100"
                  }`}
                >
                  {msg.from === "partner" ? "Partner" : "Admin"}
                </p>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sendingMessage ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
