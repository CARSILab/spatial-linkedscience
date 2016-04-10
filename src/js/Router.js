import $ from 'jquery'
import { slide } from './Dom'
import App from './App'

// Checks hash and calls appropriate function
function checkHash () {
  const hash = window.location.hash.slice(1)
  const uri = `<http://spatial.linkedscience.org/context/${hash}>`

  if (hash.match(/^search/)) {
    let key = decodeURIComponent(hash.match(/key=([^&]+)/)[1].replace(/\+/g, ' '))
    let conf = hash.match(/conf=([^&]+)/)[1]
    slide('right')
    App.search(key, conf)
  } else if (hash.match(/^person/)) {
    slide('right')
    App.select('author', uri)
  } else if (hash.match(/^affiliation/)) {
    slide('right')
    App.select('affiliation', uri)
  } else if (hash.match(/\/paper\//)) {
    slide('right')
    App.select('paper', uri)
  } else {
    slide('left')
  }
}

// Add event listener to window that will call checkHash whenever the hash is changed
$(function () {
  checkHash()
  window.addEventListener('hashchange', checkHash)
})
