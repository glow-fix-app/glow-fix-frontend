import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Button, 
  Card, 
  Spinner, 
  Select, 
  ListBox, 
  Label,
  toast
} from "@heroui/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { 
  ChatBubbleLeftRightIcon, 
  PencilIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  SparklesIcon 
} from "@heroicons/react/24/outline";

import { UserAvatar } from "@/components/ui/UserAvatar";
import EmptyState from "@/components/feedback/EmptyState";
import { providerApi } from "@/features/provider/services/providerApi";

export default function ProviderReviewsPage() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // 1. Fetch Manager's Business Details
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["myBusiness"],
    queryFn: providerApi.myBusiness,
  });

  const businessId = business?.id;

  // 2. Fetch Business Rating Summary
  const { data: ratingSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["ratingSummary", businessId],
    queryFn: () => providerApi.getBusinessRatingSummary(businessId),
    enabled: !!businessId,
  });

  // 3. Fetch Business Reviews with sorting & filtering
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["businessReviews", businessId, ratingFilter, sortBy],
    queryFn: () => 
      providerApi.getBusinessReviews(businessId, {
        rating: ratingFilter || undefined,
        sortBy: sortBy,
      }),
    enabled: !!businessId,
  });

  // 4. Mutation to post/update a reply
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => providerApi.replyToReview(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessReviews", businessId] });
      queryClient.invalidateQueries({ queryKey: ["ratingSummary", businessId] });
      toast.success("Reply submitted successfully!");
      setReplyingReviewId(null);
      setReplyText("");
    },
    onError: () => {
      toast.danger("Failed to submit reply. Please try again.");
    }
  });

  const handleStartReply = (review) => {
    setReplyingReviewId(review.id);
    setReplyText(review.reply || "");
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyText("");
  };

  const handleSubmitReply = (reviewId) => {
    if (!replyText.trim()) {
      toast.danger("Reply text cannot be empty.");
      return;
    }
    replyMutation.mutate({ reviewId, reply: replyText.trim() });
  };

  if (isBusinessLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">Loading reviews page...</p>
      </div>
    );
  }

  const averageRating = ratingSummary?.average_rating || 0;
  const totalReviewsCount = ratingSummary?.total_reviews || 0;
  const distribution = ratingSummary?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="w-full pb-8">
      {/* Header bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer reviews and feedback for your workshop</p>
      </div>

      {/* Ratings Dashboard Cards */}
      {isSummaryLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" color="primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Overall score */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white flex flex-col items-center justify-center text-center">
            <span className="text-[52px] font-bold text-text-primary leading-none tracking-tight">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-6 w-6 ${i < Math.round(averageRating) ? "text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="mt-4 text-[11px] font-bold tracking-wider text-text-tertiary uppercase">
              {totalReviewsCount} {totalReviewsCount === 1 ? "total review" : "total reviews"}
            </span>
          </Card>

          {/* Card 2: Rating Breakdown */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white flex flex-col justify-center gap-2.5">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1 px-1">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-right font-medium text-text-secondary">{stars}</span>
                  <StarIcon className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                  <span className="w-8 text-right text-[12px] font-medium text-text-tertiary">{percent}%</span>
                </div>
              );
            })}
          </Card>

          {/* Card 3: Sub-scores */}
          <Card className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white flex flex-col justify-center gap-4.5">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider px-1">Sub-Scores</h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-text-secondary">Quality</span>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {ratingSummary?.average_quality ? `${ratingSummary.average_quality.toFixed(1)}/5` : "0.0/5"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="text-xs font-semibold text-text-secondary">Communication</span>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {ratingSummary?.average_communication ? `${ratingSummary.average_communication.toFixed(1)}/5` : "0.0/5"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-text-secondary">Punctuality</span>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {ratingSummary?.average_punctuality ? `${ratingSummary.average_punctuality.toFixed(1)}/5` : "0.0/5"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 mb-6">
        {/* Rating Filter Select */}
        <div className="w-full sm:w-[180px]">
          <Select 
            className="w-full"
            placeholder="All Ratings"
            selectedKeys={ratingFilter ? [ratingFilter] : ["all"]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0];
              setRatingFilter(val === "all" ? "" : val);
            }}
          >
            <Label className="sr-only">Rating Filter</Label>
            <Select.Trigger className="h-10 w-full rounded-xl border border-gray-200 px-4 text-[13px] font-semibold transition-all outline-none bg-white text-text-secondary focus:border-brand-500 flex items-center justify-between cursor-pointer shadow-sm">
              <Select.Value />
              <Select.Indicator>▼</Select.Indicator>
            </Select.Trigger>
            <Select.Popover className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999] min-w-[180px]">
              <ListBox>
                <ListBox.Item id="all" textValue="All Ratings" className="px-3 py-1.5 text-[13px] hover:bg-slate-50 rounded-lg cursor-pointer">
                  All Ratings
                </ListBox.Item>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <ListBox.Item 
                    key={stars} 
                    id={String(stars)} 
                    textValue={`${stars} Stars`}
                    className="px-3 py-1.5 text-[13px] hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    {stars} Stars
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Sort Select */}
        <div className="w-full sm:w-[180px]">
          <Select 
            className="w-full"
            placeholder="Most Recent"
            selectedKeys={[sortBy]}
            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
          >
            <Label className="sr-only">Sort Reviews</Label>
            <Select.Trigger className="h-10 w-full rounded-xl border border-gray-200 px-4 text-[13px] font-semibold transition-all outline-none bg-white text-text-secondary focus:border-brand-500 flex items-center justify-between cursor-pointer shadow-sm">
              <Select.Value />
              <Select.Indicator>▼</Select.Indicator>
            </Select.Trigger>
            <Select.Popover className="bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999] min-w-[180px]">
              <ListBox>
                <ListBox.Item id="createdAt_desc" textValue="Most Recent" className="px-3 py-1.5 text-[13px] hover:bg-slate-50 rounded-lg cursor-pointer">
                  Most Recent
                </ListBox.Item>
                <ListBox.Item id="rating_desc" textValue="Highest Rating" className="px-3 py-1.5 text-[13px] hover:bg-slate-50 rounded-lg cursor-pointer">
                  Highest Rating
                </ListBox.Item>
                <ListBox.Item id="rating_asc" textValue="Lowest Rating" className="px-3 py-1.5 text-[13px] hover:bg-slate-50 rounded-lg cursor-pointer">
                  Lowest Rating
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      {isReviewsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" color="primary" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          message="No reviews match your selected filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isReplying = replyingReviewId === review.id;
            return (
              <Card 
                key={review.id}
                className="border-none p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] rounded-[24px] bg-white"
              >
                <div className="flex items-start gap-4">
                  {/* User avatar containing initials */}
                  <UserAvatar 
                    user={{ fullName: review.client_name }}
                    className="h-10 w-10 text-sm font-bold bg-slate-50"
                  />

                  {/* Review Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-[14px] font-bold text-text-primary leading-none">
                          {review.client_name}
                        </h4>
                        <span className="text-[11px] text-text-tertiary">
                          {new Date(review.created_at).toLocaleDateString("en-EG", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-text-tertiary select-none">
                        {review.booking_id}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>

                    {/* Client Comment */}
                    {review.comment && (
                      <p className="mt-3 text-[13.5px] text-text-secondary leading-relaxed italic pr-2">
                        "{review.comment}"
                      </p>
                    )}

                    {/* Manager Reply Display / Form */}
                    <div className="mt-4">
                      {isReplying ? (
                        <div className="space-y-3 mt-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <textarea
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all bg-white"
                            rows={3}
                            placeholder="Write your response to this customer..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="light"
                              className="rounded-full h-8 px-4 text-xs font-semibold text-text-tertiary"
                              onPress={handleCancelReply}
                              isDisabled={replyMutation.isPending}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              color="primary"
                              className="rounded-full h-8 px-5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
                              onPress={() => handleSubmitReply(review.id)}
                              isLoading={replyMutation.isPending}
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      ) : review.reply ? (
                        <div className="group relative mt-3 flex flex-col gap-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-[13px] text-text-secondary leading-relaxed">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider">Your Reply</span>
                              <span className="text-gray-300 font-normal text-[11px]">•</span>
                              <span className="text-text-tertiary text-[10px]">
                                {new Date(review.replied_at || review.updated_at).toLocaleDateString("en-EG", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit"
                                })}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStartReply(review)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
                            >
                              <PencilIcon className="h-3 w-3" />
                              Edit
                            </button>
                          </div>
                          <p className="mt-1.5 text-text-tertiary">
                            {review.reply}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartReply(review)}
                          className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
                        >
                          <SparklesIcon className="h-4 w-4" />
                          Write a Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
