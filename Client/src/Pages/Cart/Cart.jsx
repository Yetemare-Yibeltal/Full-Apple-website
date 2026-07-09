import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

export default function Cart () {
  const { cart, updateItem, removeItem } = useCart()

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className='max-w-2xl mx-auto px-6 py-24 text-center'>
        <SEO title='Cart' />
        <h1 className='text-3xl font-display font-bold mb-4'>
          Your cart is empty
        </h1>
        <p className='text-text-muted mb-6'>
          Looks like you haven't added anything yet.
        </p>
        <Link to='/'>
          <Button variant='primary'>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEO title='Cart' />
      <section className='max-w-4xl mx-auto px-6 py-12'>
        <h1 className='text-3xl font-display font-bold mb-8'>
          Your <GradientText>Cart</GradientText>
        </h1>

        <div className='flex flex-col gap-4 mb-8'>
          {cart.items.map(item => (
            <GlassPanel key={item._id} className='p-4 flex items-center gap-4'>
              <div className='w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0'>
                {item.product?.media?.[0]?.url ? (
                  <img
                    src={item.product.media[0].url}
                    alt={item.product.name}
                    className='object-contain h-full'
                  />
                ) : (
                  <span className='text-xs text-text-muted'>No image</span>
                )}
              </div>

              <div className='flex-1'>
                <h3 className='font-display font-semibold'>
                  {item.product?.name}
                </h3>
                {item.variantLabel && (
                  <p className='text-sm text-text-muted'>{item.variantLabel}</p>
                )}
                <p className='font-mono text-glow text-sm'>
                  ${item.priceAtAdd}
                </p>
              </div>

              <div className='flex items-center border border-white/10 rounded-full'>
                <button
                  onClick={() =>
                    updateItem(item._id, Math.max(1, item.quantity - 1))
                  }
                  className='px-3 py-1'
                >
                  -
                </button>
                <span className='px-2'>{item.quantity}</span>
                <button
                  onClick={() => updateItem(item._id, item.quantity + 1)}
                  className='px-3 py-1'
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item._id)}
                className='text-text-muted hover:text-prism-rose text-sm'
              >
                Remove
              </button>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className='p-6 flex items-center justify-between'>
          <div>
            <p className='text-text-muted text-sm'>Subtotal</p>
            <p className='font-mono text-2xl text-glow'>
              ${cart.subtotal?.toFixed(2)}
            </p>
          </div>
          <Link to='/checkout'>
            <Button variant='primary'>Proceed to Checkout</Button>
          </Link>
        </GlassPanel>
      </section>
    </>
  )
}
