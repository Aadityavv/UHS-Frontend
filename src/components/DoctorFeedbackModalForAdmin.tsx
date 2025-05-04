import { useState, useEffect } from "react";
import { Star, StarOff, ChevronLeft, ChevronRight } from "lucide-react";

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedbackData: Feedback[];
}

type SortOrder = "high-to-low" | "low-to-high";

const DoctorFeedbackModal = ({ isOpen, onClose, feedbackData }: Props) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("high-to-low");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sortedFeedbacks = [...feedbackData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .sort((a, b) => sortOrder === "high-to-low" ? b.rating - a.rating : a.rating - b.rating);

  const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
  const currentFeedbacks = sortedFeedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-xl h-[80vh] overflow-y-auto rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Doctor Feedback</h2>
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
              Showing {feedbackData.length} {feedbackData.length === 1 ? "review" : "reviews"}
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-order" className="text-sm text-gray-600">Sort by:</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="high-to-low">Highest rating</option>
                <option value="low-to-high">Lowest rating</option>
              </select>
            </div>
          </div>

          {/* Feedback List */}
          {currentFeedbacks.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No feedback available.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {currentFeedbacks.map((fb) => (
                  <li key={fb.id} className="py-5">
                    <div className="flex items-center">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) =>
                          i < fb.rating ? (
                            <Star key={i} size={20} className="text-yellow-400 fill-current" />
                          ) : (
                            <StarOff key={i} size={20} className="text-gray-300 stroke-current" />
                          )
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{fb.rating} out of 5</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {fb.comment || <span className="text-gray-400 italic">No comment provided</span>}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 border rounded-lg ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 border rounded-lg ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFeedbackModal;
