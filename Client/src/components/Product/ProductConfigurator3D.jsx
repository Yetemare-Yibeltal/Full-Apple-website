import { useState, useEffect, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import Scene from '../3d/Scene'
import LightRig from '../3d/LightRig'
import ProductModel from '../3d/ProductModel'

export default function ProductConfigurator3D ({ product, onVariantChange }) {
  const variants = product.variants || []
  const [selectedId, setSelectedId] = useState(variants[0]?._id || null)

  const selectedVariant = useMemo(
    () => variants.find(v => v._id === selectedId) || null,
    [variants, selectedId]
  )

  useEffect(() => {
    onVariantChange?.(selectedVariant)
  }, [selectedVariant, onVariantChange])

  const storageOptions = [
    ...new Set(variants.map(v => v.storage).filter(Boolean))
  ]
  const colorOptions = variants.filter(
    (v, i, arr) => arr.findIndex(x => x.colorName === v.colorName) === i
  )

  function selectByStorage (storage) {
    const match =
      variants.find(
        v => v.storage === storage && v.colorName === selectedVariant?.colorName
      ) || variants.find(v => v.storage === storage)
    if (match) setSelectedId(match._id)
  }

  function selectByColor (colorName) {
    const match =
      variants.find(
        v => v.colorName === colorName && v.storage === selectedVariant?.storage
      ) || variants.find(v => v.colorName === colorName)
    if (match) setSelectedId(match._id)
  }

  return (
    <div>
      <div className='h-[420px] rounded-2xl overflow-hidden bg-white/5'>
        <Scene cameraPosition={[0, 0, 5]}>
          <LightRig />
          <ProductModel
            modelUrl={product.modelUrl}
            color={selectedVariant?.colorHex || '#1d1d1f'}
          />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Scene>
      </div>

      {colorOptions.length > 0 && (
        <div className='mt-6'>
          <p className='text-sm text-text-muted mb-2'>
            {selectedVariant?.colorName}
          </p>
          <div className='flex gap-3'>
            {colorOptions.map(v => (
              <button
                key={v.colorName}
                onClick={() => selectByColor(v.colorName)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  selectedVariant?.colorName === v.colorName
                    ? 'border-glow scale-110'
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: v.colorHex }}
                aria-label={v.colorName}
              />
            ))}
          </div>
        </div>
      )}

      {storageOptions.length > 0 && (
        <div className='mt-6'>
          <p className='text-sm text-text-muted mb-2'>Storage</p>
          <div className='flex gap-3'>
            {storageOptions.map(storage => (
              <button
                key={storage}
                onClick={() => selectByStorage(storage)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  selectedVariant?.storage === storage
                    ? 'border-glow text-glow'
                    : 'border-white/20 text-text-primary'
                }`}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
