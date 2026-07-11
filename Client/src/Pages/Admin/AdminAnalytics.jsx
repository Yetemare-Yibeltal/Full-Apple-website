import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import api from '../../lib/api'
import GlassPanel from '../../components/ui/GlassPanel'
import GradientText from '../../components/ui/GradientText'
import SEO from '../../components/SEO'
import './Admin.css'

const statusColors = {
  pending: '#9AA0AE',
  processing: '#7C6CF6',
  shipped: '#4FD3C4',
  delivered: '#34d399',
  cancelled: '#FF7AC6'
}

export default function AdminAnalytics () {
  const [breakdown, setBreakdown] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    api
      .get('/admin/stats/order-status-breakdown')
      .then(res => setBreakdown(res.data.breakdown))
    api
      .get('/admin/stats/top-products')
      .then(res => setTopProducts(res.data.products))
  }, [])

  return (
    <>
      <SEO title='Analytics' />
      <section className='max-w-4xl mx-auto px-6 py-12'>
        <h1 className='text-3xl font-display font-bold mb-8'>
          <GradientText>Analytics</GradientText>
        </h1>

        <GlassPanel className='p-6 mb-8'>
          <h2 className='font-display font-semibold mb-4'>
            Order Status Breakdown
          </h2>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={breakdown}
                dataKey='count'
                nameKey='status'
                cx='50%'
                cy='50%'
                outerRadius={100}
                label
              >
                {breakdown.map(entry => (
                  <Cell
                    key={entry.status}
                    fill={statusColors[entry.status] || '#9AA0AE'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#05060A',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel className='p-6'>
          <h2 className='font-display font-semibold mb-4'>
            Top Products by Sales
          </h2>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td className='font-mono'>{p.salesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </section>
    </>
  )
}
