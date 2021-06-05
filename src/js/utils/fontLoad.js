import { load } from 'webfontloader'

const fontLoad = () => {
  load({
    google: {
      families: ['Noto+Sans+JP'],
    },
  })
}

export default fontLoad
