import { debounce } from 'lodash-es'

const viewport = document.querySelector('meta[name="viewport"]')

const windowNarrow = () => {
  function switchViewport() {
    const value = window.outerWidth > 360 ? 'width=device-width,initial-scale=1' : 'width=360'
    if (viewport.getAttribute('content') !== value) {
      viewport.setAttribute('content', value)
    }
  }
  addEventListener('resize', debounce(switchViewport, 500), false)
  switchViewport()
}

export default windowNarrow
