import React, { useState } from "react";
import { Card, Button, toast } from "@heroui/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

function StarRatingInput({ label, rating, onChange, disabled }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[14px] font-medium text-text-secondary">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              className={`p-0.5 focus:outline-none transition-transform ${disabled ? "" : "hover:scale-110 active:scale-95 cursor-pointer"}`}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              onClick={() => !disabled && onChange(star)}
            >
              {isSelected ? (
                <StarIcon className="h-6 w-6 text-amber-400" />
              ) : (
                <StarOutlineIcon className="h-6 w-6 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StarRow({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${star <= count ? "text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function BookingReviewSection({
  bookingId,
  canReview,
  existingReview,
  onSubmitReview,
  isSubmitting,
}) {
  const [qualityRating, setQualityRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [comment, setComment] = useState("");

  // Calculate overall rating dynamically from non-zero sub-ratings
  const subRatings = [qualityRating, punctualityRating, communicationRating].filter((r) => r > 0);
  const rating = subRatings.length > 0
    ? Math.round(subRatings.reduce((sum, val) => sum + val, 0) / subRatings.length)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.danger("Please rate at least one category (Quality, Punctuality, or Communication)");
      return;
    }

    const payload = {
      booking_id: bookingId,
      rating,
      comment: comment.trim() || undefined,
    };

    if (qualityRating > 0) payload.quality_rating = qualityRating;
    if (punctualityRating > 0) payload.punctuality_rating = punctualityRating;
    if (communicationRating > 0) payload.communication_rating = communicationRating;

    onSubmitReview(payload);
  };

  // 1. Existing Review State
  if (existingReview) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-semibold text-text-primary">Your Review</h3>
          <span className="text-xs text-text-muted">
            {new Date(existingReview.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-text-primary">Overall Rating</span>
              <StarRow count={existingReview.rating} />
            </div>
            {existingReview.quality_rating && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">Quality</span>
                <StarRow count={existingReview.quality_rating} />
              </div>
            )}
            {existingReview.punctuality_rating && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">Punctuality</span>
                <StarRow count={existingReview.punctuality_rating} />
              </div>
            )}
            {existingReview.communication_rating && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">Communication</span>
                <StarRow count={existingReview.communication_rating} />
              </div>
            )}
          </div>

          {existingReview.comment && (
            <p className="text-[14px] leading-relaxed text-text-secondary italic">
              "{existingReview.comment}"
            </p>
          )}

          {/* Provider Manager Reply */}
          {existingReview.reply && (
            <div className="mt-4 rounded-xl bg-surface-hover p-4 border-l-4 border-brand-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">
                  Response from {existingReview.business_name || "Provider"}
                </span>
                <span className="text-[10px] text-text-muted">
                  {existingReview.replied_at &&
                    new Date(existingReview.replied_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </span>
              </div>
              <p className="text-[13px] text-text-secondary">
                "{existingReview.reply}"
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // 2. Can't review and no existing review
  if (!canReview) {
    return null;
  }

  // 3. Review Form State
  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base font-semibold text-text-primary">Rate Your Experience</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Share your feedback on the service provided by this workshop.
          </p>
        </div>

        {/* Rating categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">

          <StarRatingInput
            label="Quality of Service"
            rating={qualityRating}
            onChange={setQualityRating}
            disabled={isSubmitting}
          />
          <StarRatingInput
            label="Punctuality"
            rating={punctualityRating}
            onChange={setPunctualityRating}
            disabled={isSubmitting}
          />
          <StarRatingInput
            label="Communication"
            rating={communicationRating}
            onChange={setCommunicationRating}
            disabled={isSubmitting}
          />
        </div>

        {/* Written Comment Textarea */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comment-input" className="text-xs font-semibold text-text-secondary">
            Your Comment (Optional)
          </label>
          <textarea
            id="comment-input"
            rows={3}
            maxLength={600}
            disabled={isSubmitting}
            placeholder="Tell us what you liked or how they can improve..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-[14px] text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-surface-hover"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-text-muted">{comment.length}/600</span>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6"
            radius="full"
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Card>
  );
}
