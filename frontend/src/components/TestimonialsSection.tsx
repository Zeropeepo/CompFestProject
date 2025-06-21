// Save this file as: src/components/TestimonialsSection.tsx
import React from 'react';
import StarRating from './StarRating'; // Import our new StarRating component

// --- Data Structures ---
type Testimonial = {
  name: string;
  review: string;
  rating: number;
  avatar: string;
};

// Sample data as required by Level 2.
const sampleTestimonials: Testimonial[] = [
  {
    name: 'Aisha Lestari',
    review: 'The Diet Plan is amazing! I’ve lost 5kg in a month without feeling hungry. The food is delicious and the delivery is always on time.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Budi Santoso',
    review: 'As a gym enthusiast, the Protein Plan has been a game-changer for my recovery. The meals are packed with protein and taste great. Highly recommended!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Caitlyn Angela',
    review: 'The Royal Plan feels like having a personal chef. Every meal is a gourmet experience. It’s worth every penny for the quality and convenience.',
    rating: 4,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

const TestimonialsSection = () => {
  // State for the form inputs
  const [newReview, setNewReview] = React.useState({ name: '', review: '' });
  const [newRating, setNewRating] = React.useState(0);
  const [testimonials, setTestimonials] = React.useState(sampleTestimonials);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.name && newReview.review && newRating > 0) {
      const newTestimonial: Testimonial = {
        ...newReview,
        rating: newRating,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      };
      setTestimonials([newTestimonial, ...testimonials]);
      // Reset the form
      setNewReview({ name: '', review: '' });
      setNewRating(0);
    }
  };

  return (
    <section className="py-20 bg-amber-50">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800">What Our Customers Say</h2>
          <p className="text-gray-600 mt-2">Real stories from our happy and healthy community.</p>
        </div>

        {/* --- Testimonials Display --- */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <div className="flex items-center mb-4">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <StarRating rating={testimonial.rating} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">"{testimonial.review}"</p>
            </div>
          ))}
        </div>

        {/* --- New Testimonial Form --- */}
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share Your Experience!</h3>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Budi Santoso"
                required
              />
            </div>
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Review Message</label>
              <textarea
                id="review"
                rows={4}
                value={newReview.review}
                onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Tell us about your meals..."
                required
              ></textarea>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Your Rating</label>
              <StarRating rating={newRating} setRating={setNewRating} />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Testimonial
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
