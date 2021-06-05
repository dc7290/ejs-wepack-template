// No deletions from here
import '../scss/index.scss'
// to here.

// import fontLoad from './utils/fontLoad'
// fontLoad()

import windowNarrow from './utils/windowNarrow'
windowNarrow()

import inPageScroll from './utils/inPageScroll'
inPageScroll()

const app = document.getElementById('app')

app.style.margin = '100px 0'

app.innerHTML = `<h1 class="title">Compilation succeeded!</h1>
<p class="body">If you want more information, you can visit <a href="" target="_blank" rel="noreferrer">here.</a></p>`
