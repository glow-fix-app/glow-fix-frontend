import React from "react";
import { Link } from "react-router-dom";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ReviewCard from "@/components/dashboard/ReviewCard";
import EmptyState from "@/components/feedback/EmptyState";

export default function ProviderDashboardReviews({ reviews = [] }) {
  return (
    <div className="mt-8 mb-6">
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-sm font-semibold text-gray-900">Recent Reviews</h3>
        <Link
          to="/provider/reviews"
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-12 shadow-sm">
          <EmptyState
            title="No reviews yet"
            message="When customers leave reviews, they will appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
