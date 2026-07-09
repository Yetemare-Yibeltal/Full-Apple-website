import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import GlassPanel from '../../components/ui/GlassPanel'
import Button from '../../components/ui/Button'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'

const emptyAddress = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  country: '',
  postalCode: '',
  isDefault: false
}

export default function Profile () {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [addresses, setAddresses] = useState([])
  const [newAddress, setNewAddress] = useState(emptyAddress)

  useEffect(() => {
    api.get('/users/addresses').then(res => setAddresses(res.data.addresses))
  }, [])

  async function handleProfileSave (e) {
    e.preventDefault()
    try {
      await api.put('/users/profile', { name, phone })
      showToast('Profile updated', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handlePasswordChange (e) {
    e.preventDefault()
    try {
      await api.put('/users/password', { currentPassword, newPassword })
      showToast('Password changed', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleAddAddress (e) {
    e.preventDefault()
    try {
      const res = await api.post('/users/addresses', newAddress)
      setAddresses(res.data.addresses)
      setNewAddress(emptyAddress)
      showToast('Address added', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleDeleteAddress (addressId) {
    const res = await api.delete(`/users/addresses/${addressId}`)
    setAddresses(res.data.addresses)
  }

  return (
    <>
      <SEO title='Account' />
      <section className='max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-display font-bold'>
            My <GradientText>Account</GradientText>
          </h1>
          <div className='flex gap-4'>
            <Link to='/account/orders' className='text-sm text-glow'>
              Order History
            </Link>
            <button
              onClick={logout}
              className='text-sm text-text-muted hover:text-prism-rose'
            >
              Log Out
            </button>
          </div>
        </div>

        <GlassPanel className='p-6'>
          <h2 className='font-display font-semibold mb-4'>Profile</h2>
          <form onSubmit={handleProfileSave} className='flex flex-col gap-3'>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Name'
              className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm'
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder='Phone'
              className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm'
            />
            <Button type='submit' variant='primary' className='self-start'>
              Save
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className='p-6'>
          <h2 className='font-display font-semibold mb-4'>Change Password</h2>
          <form onSubmit={handlePasswordChange} className='flex flex-col gap-3'>
            <input
              type='password'
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder='Current password'
              className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm'
            />
            <input
              type='password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder='New password'
              className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm'
            />
            <Button type='submit' variant='primary' className='self-start'>
              Update Password
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className='p-6'>
          <h2 className='font-display font-semibold mb-4'>Addresses</h2>
          <div className='flex flex-col gap-3 mb-6'>
            {addresses.map(addr => (
              <div
                key={addr._id}
                className='flex justify-between items-center border border-white/10 rounded-lg p-3 text-sm'
              >
                <span>
                  {addr.fullName}, {addr.line1}, {addr.city}, {addr.country}
                  {addr.isDefault && ' (Default)'}
                </span>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className='text-prism-rose'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAddress} className='grid grid-cols-2 gap-3'>
            {[
              'fullName',
              'phone',
              'line1',
              'line2',
              'city',
              'region',
              'country',
              'postalCode'
            ].map(field => (
              <input
                key={field}
                value={newAddress[field] || ''}
                onChange={e =>
                  setNewAddress(a => ({ ...a, [field]: e.target.value }))
                }
                placeholder={field}
                className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm'
              />
            ))}
            <Button type='submit' variant='glass' className='col-span-2'>
              Add Address
            </Button>
          </form>
        </GlassPanel>
      </section>
    </>
  )
}
