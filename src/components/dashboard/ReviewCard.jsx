import React from "react";
import { Card } from "@heroui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import { UserAvatar } from "@/components/ui/UserAvatar";

/**
 * ReviewCard
 * A clean card for displaying a user review with provider reply.
 *
 * Props:
 *   review {object} - Review data
 *     - user {object}
 *     - rating {number}
 *     - comment {string}
 *     - reply {string}
 */
export default function ReviewCard({ review }) {
  const { user, rating, comment, reply } = review;
  
  return (
    <Card className="border border-gray-100 bg-white shadow-sm h-full rounded-xl overflow-hidden">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar user={user} className="w-10 h-10 text-sm bg-gray-100 text-gray-700" />
          <div>
            <h4 className="font-medium text-sm text-gray-900">{user?.fullName || "User"}</h4>
            <div className="flex gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rating ? "text-amber-400" : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4 flex-grow">
          {comment || "No comment provided."}
        </div>
        
        {reply && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100 mt-auto">
            <span className="font-semibold text-gray-800">Your reply:</span> {reply}
          </div>
        )}
      </div>
    </Card>
  );
}
