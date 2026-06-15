import React, { useState, useMemo } from "react";
import { Accordion, Button, Card, InputGroup } from "@heroui/react";
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { chatApi } from "@/features/chat/services/chatApi";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";

const FAQS = [
  {
    id: "payouts",
    question: "How do payouts work?",
    answer: "Payouts are processed every Monday. Your available balance is transferred to your linked bank account. Commission is deducted automatically from each booking.",
  },
  {
    id: "dispute",
    question: "How do I handle a disputed booking?",
    answer: "If a customer disputes a booking, please contact our support team with any evidence you have. We mediate all disputes and aim to resolve them fairly within 48 hours.",
  },
  {
    id: "availability",
    question: "How do I update my availability?",
    answer: "You can update your working hours and availability in the Calendar tab. Simply click on a time slot to block it out or make it available.",
  },
  {
    id: "verification",
    question: "How does the verification process work?",
    answer: "To ensure trust on our platform, all providers must submit identification and business documents. Verification typically takes 1-2 business days once all documents are submitted.",
  },
  {
    id: "discounts",
    question: "Can I offer discounts to customers?",
    answer: "Yes, you can create promotional codes or adjust your service prices in the Services tab. Discounts will be applied at checkout for the customer.",
  },
  {
    id: "walkin",
    question: "How do walk-in jobs work?",
    answer: "You can manually add walk-in jobs to your Calendar to block out the time and keep all your revenue tracking in one place. These jobs are not charged commission.",
  }
];

function HelpSearchBar({ value, onChange }) {
  return (
    <InputGroup
      fullWidth
      className="h-10 rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-gray-300"
    >
      <InputGroup.Prefix className="pl-3 pr-2 text-text-muted">
        <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
      </InputGroup.Prefix>
      <InputGroup.Input
        className="text-[14px] text-text-primary placeholder:text-text-muted w-full focus:outline-none py-2 bg-transparent"
        placeholder="Search help articles..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputGroup>
  );
}

export default function ProviderHelpPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);

  const visibleFaqs = useMemo(() => {
    if (!query.trim()) return FAQS;
    const lowerQuery = query.toLowerCase();
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleStartChat = async () => {
    try {
      setIsStartingChat(true);
      const conversation = await chatApi.supportConversation();
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat });
      navigate(`/provider/chat?id=${conversation.id}`);
    } catch (err) {
      console.error("Failed to start support chat:", err);
      alert("Error: " + (err.response?.data?.message || err.message || JSON.stringify(err)));
      // Fallback if no admin is found or error occurs
      // navigate("/provider/chat");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Help & Support</h1>
        <p className="mt-2 text-[15px] text-text-secondary">Find answers to common questions or contact our support team.</p>
      </div>
      
      <div className="w-full max-w-2xl">
        <HelpSearchBar value={query} onChange={setQuery} />
      </div>

      <Card className="border-none bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] rounded-2xl overflow-hidden w-full">
        <div className="px-8 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
          <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Frequently Asked Questions</h2>
        </div>
        
        {visibleFaqs.length === 0 ? (
           <div className="py-12 text-center">
             <p className="text-[15px] text-text-tertiary">
               No articles match your search.
             </p>
           </div>
        ) : (
          <Accordion
            className="rounded-none border-0 bg-white [&_.accordion__item:not(:last-child)]:border-b [&_.accordion__item:not(:last-child)]:border-gray-100"
          >
            {visibleFaqs.map((faq) => (
              <Accordion.Item key={faq.id} id={faq.id} className="accordion__item">
                <Accordion.Heading>
                  <Accordion.Trigger className="flex w-full items-center justify-between gap-6 px-8 py-5 text-left hover:bg-gray-50/50 transition-colors">
                    <span className="text-[15px] font-semibold text-text-primary leading-snug">{faq.question}</span>
                    <Accordion.Indicator className="shrink-0 text-gray-400" />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="px-8 pb-7 pt-1 text-[15px] leading-relaxed text-text-secondary">
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Card>

      <Card className="border-none bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] rounded-2xl w-full">
        <h2 className="text-[16px] font-bold text-text-primary mb-6 tracking-tight">Contact Support</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Button
            isLoading={isStartingChat}
            onPress={handleStartChat}
            className="h-11 rounded-xl bg-brand-500 px-6 text-[14px] font-semibold text-white transition-all hover:bg-brand-600 flex items-center gap-2 shadow-sm shadow-brand-500/20"
          >
            {!isStartingChat && <ChatBubbleLeftRightIcon className="h-5 w-5" />}
            Start Live Chat
          </Button>
          
          <div className="flex items-center gap-3 text-text-secondary">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100">
              <EnvelopeIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <a href="mailto:support@glowfix.app" className="block text-[15px] font-medium text-text-primary hover:text-brand-600 transition-colors">
                support@glowfix.app
              </a>
              <p className="mt-0.5 text-[13px] text-text-tertiary">
                Average response time: under 2 hours
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
