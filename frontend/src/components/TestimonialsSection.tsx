import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Data Structures ---
type Testimonial = {
  id: number;
  name: string;
  review: string;
  rating: number;
  avatar: string;
};


// --- Props Definition ---
type TestimonialsSectionProps = {
  isLoggedIn: boolean;
  setActivePage: (page: string) => void;
};


const TestimonialsSection = ({ isLoggedIn, setActivePage }: TestimonialsSectionProps) => {
  // --- State Management ---
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [newReview, setNewReview] = useState({ name: '', review: '' });
  const [newRating, setNewRating] = useState(0);


  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/testimonials');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const testimonialsWithAvatars = data.map((t: Testimonial) => ({
          ...t,
          avatar: `https://i.pravatar.cc/150?img=${t.id % 70}`
        }));
        setTestimonials(testimonialsWithAvatars);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      }
    };
    fetchTestimonials();
  }, []);


  // --- Pagination Logic ---
  const pageCount = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const handlePrevPage = () => setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0));
  const handleNextPage = () => setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  const currentTestimonials = testimonials.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);


  // --- Form Submission Logic ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.review || newRating === 0) {
      alert('Please fill out all fields and provide a rating.');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    const submissionData = { name: newReview.name, review: newReview.review, rating: newRating };
    
    try {

      const token = localStorage.getItem('sea-catering-token');
      const csrfToken = localStorage.getItem('sea-catering-csrf');
      const response = await fetch('http://localhost:8080/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`,
                   'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify(submissionData),
      });

      const newDbEntry = await response.json();
      if (!response.ok) throw new Error('Server responded with an error');
      
      const newTestimonial: Testimonial = {
        ...submissionData,
        id: newDbEntry.testimonialId,
        avatar: `https://i.pravatar.cc/150?img=${newDbEntry.testimonialId % 70}`
      };
      setTestimonials(prev => [newTestimonial, ...prev]);
      setCurrentPage(0);
      setSubmitStatus('success');
      setNewReview({ name: '', review: '' });
      setNewRating(0);

    } catch (error) {
      console.error("Failed to submit testimonial:", error);
      setSubmitStatus('error');

    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX (The View) ---
  return (
    <section className="py-20 bg-amber-50">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800">What Our Customers Say</h2>
          <p className="text-gray-600 mt-2">Real stories from our happy and healthy community.</p>
        </div>

        {/* Display Grid */}
        <div className="relative mb-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[16rem]">
            {testimonials.length > 0 ? (
              currentTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col transition-opacity duration-300">
                  <div className="flex items-center mb-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                      <StarRating rating={testimonial.rating} />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm flex-grow">"{testimonial.review}"</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-3 pt-12">No testimonials yet. Be the first!</p>
            )}
          </div>

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button onClick={handlePrevPage} disabled={currentPage === 0} className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <span className="text-sm font-semibold text-gray-600">
                Page {currentPage + 1} of {pageCount}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === pageCount - 1} className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Conditional Form Rendering */}
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          {isLoggedIn ? (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share Your Experience!</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" id="name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Review Message</label>
                  <textarea id="review" rows={4} value={newReview.review} onChange={(e) => setNewReview({ ...newReview, review: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none" required></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Your Rating</label>
                  <StarRating rating={newRating} setRating={setNewRating} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">
                  {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
                {submitStatus === 'success' && <p className="text-green-600 font-semibold text-center mt-2">Thank you! Your review has been submitted.</p>}
                {submitStatus === 'error' && <p className="text-red-600 font-semibold text-center mt-2">Something went wrong. Please try again.</p>}
              </form>
            </>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Want to share your story?</h3>
              <p className="text-gray-600 mb-6">Please log in to leave a review and help others on their health journey.</p>
              <button
                onClick={() => setActivePage('Login')}
                className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Login to Review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
