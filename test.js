const unfancify = require('./')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const expected = path.join(__dirname, 'fixture-expected.glsl')
const fixture = path.join(__dirname, 'fixture.glsl')

test('fancy imports', function (t) {
  const src = fs.readFileSync(fixture, 'utf8')

  t.plan(1)

  unfancify(fixture, src, {}, function (err, unfancy) {
    if (err) return t.ifError(err)
    t.equal(unfancy, fs.readFileSync(expected, 'utf8'))
  })
})
