import { useEffect, useState } from "react";
import axios from "axios";
import { Star, StarOff, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type FeedbackResponse = {
    data: Feedback[];
    nextCursor: string | null;
    prevCursor: string | null;
  };
  

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SortOrder = "high-to-low" | "low-to-high";

const FeedbackModal = ({ isOpen, onClose }: Props) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("high-to-low");
  const [error, setError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchFeedbacks = async (cursor: string | null = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized. Please log in.");
        return;
      }

      const params = new URLSearchParams();
      if (cursor) params.append("cursor", cursor);
      params.append("sort", sortOrder);

      const res = await axios.get<FeedbackResponse>(
        `https://uhs-backend.onrender.com/api/feedback/all?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    
      if (Array.isArray(res.data) && res.data.length && "message" in res.data[0]) {
        setFeedbacks([]);
        setError(res.data[0].message); // Shows message like "Feedback will be visible after 10 responses."
        return;
      }
  

      setFeedbacks(res.data.data);  // not just res.data
      setNextCursor(res.data.nextCursor);      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
      setError("Could not load feedbacks. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeedbacks();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset pagination when sort order changes
    if (isOpen) {
      setCursorStack([]);
      setCurrentCursor(null);
      fetchFeedbacks();
    }
  }, [sortOrder]);

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorStack([...cursorStack, currentCursor || ""]);
      setCurrentCursor(nextCursor);
      fetchFeedbacks(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorStack.length > 0) {
      const newStack = [...cursorStack];
      const prevCursor = newStack.pop();
      setCursorStack(newStack);
      setCurrentCursor(prevCursor || null);
      fetchFeedbacks(prevCursor || null);
    }
  };

  const sortedFeedbacks = [...feedbacks]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Most recent first
  .sort((a, b) => sortOrder === "high-to-low" ? b.rating - a.rating : a.rating - b.rating); // Then by rating


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-xl h-[80vh] overflow-y-auto rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Patient Feedback</h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-blue-100 transition-colors text-xl"
              aria-label="Close feedback modal"
            >
              &times;
            </button>
          </div>
          <p className="text-blue-100 mt-1">Anonymous patient reviews</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Showing {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-order" className="text-sm text-gray-600">Sort by:</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="high-to-low">Highest rating</option>
                <option value="low-to-high">Lowest rating</option>
              </select>
            </div>
          </div>

          {/* Feedback List */}
          {loading && feedbacks.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : sortedFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
              <p className="mt-1 text-sm text-gray-500">Patient feedback will appear here once submitted.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {sortedFeedbacks.map((fb) => (
                  <li key={fb.id} className="py-5">
                    <div className="flex items-center">
                      <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
  i < fb.rating ? (
    <Star 
      key={i} 
      size={20} 
      className="text-yellow-400 fill-current" 
      aria-hidden="true"
    />
  ) : (
    <StarOff 
      key={i} 
      size={20} 
      className="text-gray-300 stroke-current" 
      aria-hidden="true"
    />
  )
))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {fb.rating} out of 5
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                      {new Date(fb.createdAt).toLocaleDateString("en-GB")}

                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {fb.comment || <span className="text-gray-400 italic">No comment provided</span>}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={cursorStack.length === 0}
                  className={`flex items-center px-4 py-2 border rounded-lg ${cursorStack.length === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="text-sm text-gray-500">
                  Page {cursorStack.length + 1}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={!nextCursor}
                  className={`flex items-center px-4 py-2 border rounded-lg ${!nextCursor ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;