import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Accordion, Button, Card, InputGroup } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { HELP_CATEGORIES, HELP_FAQS } from "@/features/client/data/helpCenter";

const CATEGORY_ICONS = {
  bookings: CalendarDaysIcon,
  payments: CreditCardIcon,
  providers: UserPlusIcon,
  account: ShieldCheckIcon,
  disputes: ExclamationCircleIcon,
  technical: WrenchScrewdriverIcon,
};

function matchesQuery(text, query) {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function HelpCategoryCard({ category, isActive, onSelect }) {
  const Icon = CATEGORY_ICONS[category.id];

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl border bg-white px-5 py-5 text-left transition-colors ${
        isActive
          ? "border-black bg-surface-hover"
          : "border-gray-200 hover:border-gray-300 hover:bg-surface-hover"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden="true" />
      <span className="text-[15px] font-semibold text-text-primary">{category.label}</span>
    </button>
  );
}

function HelpSearchBar({ value, onChange, onSubmit }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.();
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <InputGroup
        fullWidth
        className="h-14 rounded-full border border-border-default bg-white px-2 shadow-sm ring-0 focus-within:border-gray-300"
      >
        <InputGroup.Prefix className="pl-4 text-text-muted">
          <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        </InputGroup.Prefix>
        <InputGroup.Input
          aria-label="Search help articles"
          className="text-[15px] text-text-primary placeholder:text-text-muted"
          placeholder="Search help articles..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <InputGroup.Suffix className="pr-1.5">
          <Button
            className="h-10 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-600"
            type="submit"
          >
            Search
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </form>
  );
}

export default function ClientHelpPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const visibleFaqs = useMemo(() => {
    return HELP_FAQS.filter((faq) => {
      const matchesCategory =
        !activeCategory || faq.categories.includes(activeCategory);
      const matchesSearch =
        matchesQuery(faq.question, query) ||
        matchesQuery(faq.answer, query) ||
        HELP_CATEGORIES.some(
          (category) =>
            faq.categories.includes(category.id) &&
            (matchesQuery(category.label, query) ||
              category.keywords.some((keyword) => matchesQuery(keyword, query))),
        );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const defaultExpandedKeys = visibleFaqs.length ? [visibleFaqs[0].id] : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Support</p>
        <h1 className="text-xl font-semibold text-text-primary">Help Center</h1>
      </header>

      {/* Search and Categories */}
      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <div className="mb-6">
          <HelpSearchBar value={query} onChange={setQuery} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((category) => (
            <HelpCategoryCard
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onSelect={(id) => setActiveCategory((current) => (current === id ? null : id))}
            />
          ))}
        </div>
      </Card>

      {/* FAQs */}
      <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">FAQs</p>
        </header>

        {visibleFaqs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-text-tertiary">
              No articles match your search. Try another keyword or browse a category above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <Accordion
              key={visibleFaqs.map((faq) => faq.id).join("-")}
              className="rounded-none border-0 bg-white [&_.accordion__item:first-child_[data-slot=accordion-trigger]]:rounded-t-xl [&_.accordion__item:last-child:not(:has([data-slot=accordion-trigger][aria-expanded=true]))_[data-slot=accordion-trigger]]:rounded-b-xl [&_.accordion__item:last-child:has([data-slot=accordion-trigger][aria-expanded=true])_[data-slot=accordion-body]]:rounded-b-xl [&_[data-slot=accordion-trigger]:hover:not([aria-expanded=true])]:!bg-gray-100 [&_[data-slot=accordion-trigger][data-hovered=true]:not([aria-expanded=true])]:!bg-gray-100"
              defaultExpandedKeys={defaultExpandedKeys}
            >
              {visibleFaqs.map((faq) => (
                <Accordion.Item key={faq.id} id={faq.id}>
                  <Accordion.Heading>
                    <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                      <span className="text-[14px] font-semibold text-text-primary">{faq.question}</span>
                      <Accordion.Indicator className="shrink-0 text-text-muted" />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body className="px-5 pb-5 text-[13px] leading-relaxed text-text-tertiary">
                      {faq.answer}
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}
      </Card>

      {/* Contact Options */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button 
          onClick={() => navigate("/chat?support=true")}
          className="w-full text-left border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          <div className="flex w-full items-start gap-4 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-text-primary">
                Live chat
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">Average reply under 5 min</p>
            </div>
          </div>
        </button>

        <a href="mailto:support@glowfix.app" className="block outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-xl">
          <Card className="h-full border-none bg-white p-6 shadow-sm ring-1 ring-black/5 rounded-xl transition-colors hover:bg-surface-hover">
            <div className="flex w-full items-start gap-4 text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <DocumentTextIcon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-text-primary">Submit a ticket</p>
                <p className="mt-1 text-[12px] text-text-tertiary">support@glowfix.app</p>
              </div>
            </div>
          </Card>
        </a>
      </div>
    </div>
  );
}
