'use strict'

const { AsyncObject, Event } = require('@cuties/cutie')
const UrlToFSPathMapper = require('./../../server/UrlToFSPathMapper')
const { StrictEqualAssertion } = require('@cuties/assert')

class FSPathByUrl extends AsyncObject {

  constructor(url, mapper) {
    super(url, mapper);
  }

  definedSyncCall() {
    return (url, mapper) => {
      return mapper(url);
    }
  }

}

new StrictEqualAssertion(
  new FSPathByUrl(
    '/html/file.html',
    new UrlToFSPathMapper('static')
  ), 'static/html/file.html'
).call()