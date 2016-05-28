import Hogan from 'hogan.js'

const icons = {
  info: '<svg class="icon icon-info"><use xlink:href="#icon-info_outline" /></svg>',
  paper: '<svg class="icon icon-paper"><use xlink:href="#icon-paper" /></svg>',
  person: '<svg class="icon icon-person"><use xlink:href="#icon-person" /></svg>',
  people: '<svg class="icon icon-people"><use xlink:href="#icon-people" /></svg>',
  place: '<svg class="icon icon-place"><use xlink:href="#icon-place" /></svg>',
  school: '<svg class="icon icon-school"><use xlink:href="#icon-school" /></svg>'
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
    <label class="dropdown__option" data-value="{{value}}">
      <input type="radio" name="conference" />
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
