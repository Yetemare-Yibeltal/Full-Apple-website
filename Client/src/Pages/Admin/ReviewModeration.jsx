import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import GlassPanel from '../../components/ui/GlassPanel';
import GradientText from '../../components/ui/GradientText';
import SEO from '../../components/SEO';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const { showToast } = useToast();

  function loadReviews() {
    api.get('/reviews/pending').then((res) => setReviews(res.data.reviews));
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function moderate(id, status) {
    try {
      await api.put(`/reviews/${id}/moderate`, { status });
      showToast(`Review ${status}`, 'success');
      loadReviews();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <>
      <SEO title="Review Moderation" />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">
          Review <GradientText>Moderation</GradientText>
        </h1>

        {reviews.length === 0 && <p className="text-text-muted">No pending reviews.</p>}

        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <GlassPanel key={review._id} className="p-5">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">{review.userName}</p>
                <p className="text-text-muted text-sm">{review.product?.name}</p>
              </div>
              <div className="text-prism-aqua mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p className="text-text-primary mb-4">{review.comment}</p>
              <div className="flex gap-3">
                <button onClick={() => moderate(review._id, 'approved')} className="text-xs px-3 py-1 rounded-full bg-prism-aqua text-obsidian">
                  Approve
                </button>
                <button onClick={() => moderate(review._id, 'rejected')} className="text-xs px-3 py-1 rounded-full bg-prism-rose text-obsidian">
                  Reject
                </button>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </>
  );
}