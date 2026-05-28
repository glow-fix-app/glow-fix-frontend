import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { Card } from "@heroui/react";
import EmptyState from "@/components/feedback/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";

function timeAgo(dateString) {
  if (!dateString) return "RECENTLY";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "1 DAY AGO";
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 WEEK AGO";
  return `${diffWeeks} WEEKS AGO`;
}

function ReviewCard({ review, businessName = "Shine & Co. Detailing" }) {
  const timeLabel = timeAgo(review.createdAt);
  const replyText = review.reply;

  return (
    <Card className="border-none p-5 shadow-none ring-1 ring-black/[0.06] rounded-3xl">
      <div className="flex items-start gap-4">
        <UserAvatar 
          user={{
            full_name: review.authorName,
            avatar: review.authorAvatar
          }}
          className="h-10 w-10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[14px] font-semibold text-text-primary">{review.authorName}</p>
              <p className="mt-0.5 text-[10px] font-medium tracking-wider text-text-muted uppercase">{timeLabel}</p>
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-3.5 w-3.5 ${i < review.rating ? "text-amber-400" : "text-text-muted"}`}
                />
              ))}
            </div>
          </div>

          {review.comment && (
            <p className="mt-3 text-[14px] font-medium leading-relaxed text-text-primary">{`“${review.comment}”`}</p>
          )}

          {replyText && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-500/5 px-4 py-3 border-l-2 border-brand-500 text-[13px] text-text-tertiary leading-relaxed">
              <span className="font-semibold text-text-primary shrink-0">{businessName}</span>
              <span className="text-text-muted shrink-0">•</span>
              <span>{replyText}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ProviderReviewsTab({ reviews = [], avgRating = 0, reviewCount = 0, businessName = "Shine & Co. Detailing" }) {
  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        message="Be the first to book and leave a review for this provider."
      />
    );
  }

  // Calculate dynamic review count label
  const totalReviews = reviewCount || reviews.length;

  return (
    <div className="grid gap-6">
      {/* Dynamic Rating Overview Section */}
      <Card className="border-none p-6 shadow-none ring-1 ring-black/[0.06] rounded-3xl">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          {/* Average Rating Block */}
          <div className="flex flex-col items-center justify-center text-center p-2 md:col-span-4 md:border-r md:border-gray-100 md:pr-6">
            <span className="text-[32px] font-semibold text-text-primary leading-none tracking-tight">
              {avgRating ? avgRating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center gap-0.5 mt-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-amber-400" : "text-text-muted"}`}
                />
              ))}
            </div>
            <span className="mt-2.5 text-[9px] font-semibold tracking-wider text-text-muted uppercase">
              {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          </div>

          {/* Sub-ratings Breakdown Progress Bars */}
          <div className="flex flex-col gap-4 md:col-span-8 md:pl-6">
            <div className="flex items-center justify-between gap-4">
              <span className="w-24 text-[10px] font-medium tracking-wider text-text-muted uppercase shrink-0">Quality</span>
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "98%" }} />
              </div>
              <span className="w-8 text-right text-[12px] font-semibold text-text-primary shrink-0">4.9</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="w-24 text-[10px] font-medium tracking-wider text-text-muted uppercase shrink-0">Communication</span>
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "96%" }} />
              </div>
              <span className="w-8 text-right text-[12px] font-semibold text-text-primary shrink-0">4.8</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="w-24 text-[10px] font-medium tracking-wider text-text-muted uppercase shrink-0">On-time rate</span>
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "94%" }} />
              </div>
              <span className="w-8 text-right text-[12px] font-semibold text-text-primary shrink-0">4.7</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Review List Grid */}
      <div className="grid gap-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} businessName={businessName} />
        ))}
      </div>
    </div>
  );
}
