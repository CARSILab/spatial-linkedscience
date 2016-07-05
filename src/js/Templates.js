import Hogan from 'hogan.js'

const icons = {
  info: '<svg class="icon icon-info"><use xlink:href="#icon-right" /></svg>',
  paper: '<svg class="icon icon-paper"><use xlink:href="#icon-papers" /></svg>',
  person: '<svg class="icon icon-person"><use xlink:href="#icon-user" /></svg>',
  place: '<svg class="icon icon-place"><use xlink:href="#icon-map-marker" /></svg>',
  school: '<svg class="icon icon-school"><use xlink:href="#icon-book" /></svg>'
}

const author = Hogan.compile(`
  <li class="list-group-item author">
    <a href="#{{ shortLink }}">{{ name }}</a>
    <a class="rawdata" target="_blank" title="Raw data for this author" href="{{ link }}">${icons.info}</a>
  </li>
`)

const paper = Hogan.compile(`
  <li class="list-group-item paper">({{ year }})
    <a href="#{{ shortLink }}"> {{ name }}</a>
    <a class="rawdata" target="_blank" title="Raw data for this paper" href="{{ link }}">${icons.info}</a>
  </li>
`)

const paperInfo = Hogan.compile(`
  <li class="list-group-item">
    <ul>
      <li><b>Year</b>: {{ year }}</li>
      <li><b>Homepage</b>: <a href="{{ homepage }}">here</a></li>
      <li><b>Part Of</b>: {{ conference }}</li>
    </ul>
  </li>
`)

const dropdownItems = Hogan.compile(`
  {{#confs}}
    <label class="dropdown__option" for="dd-{{value}}" data-value="{{value}}">
    <input class="dropdown__input" id="dd-{{value}}" type="radio" name="conference" tabindex="0"/>
      {{name}}
    </label>
  {{/confs}}
`)

export default {
  author,
  paper,
  paperInfo,
  icons,
  dropdownItems
}
