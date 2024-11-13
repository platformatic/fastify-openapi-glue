import { strict as assert } from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import Fastify from 'fastify'
import fastifyOpenapiGlue from '../index.js'
import { Service } from './service.js'

const service = new Service()

const importJSON = createRequire(import.meta.url)

const testSpec = await importJSON('./test-openapi.v3.json')
const calls = []

function onWarning (w) {
  console.log('received warning')
  assert.equal(
    w.message,
    "The 'service' option is deprecated, use 'serviceHandlers' instead."
  )
  assert.equal(w.name, 'DeprecationWarning')
  assert.equal(w.code, 'FSTOGDEP001')
  assert.ok(true, 'Got warning')
  calls.push(w.code)
}

async function delay () {
  await new Promise((resolve) => setTimeout(resolve, 100))
}

test("test if 'service' parameter still works", async (t) => {
  process.on('warning', onWarning)

  await t.test('test if warning', async (t) => {
    const fastify = Fastify()
    fastify.register(fastifyOpenapiGlue, {
      specification: testSpec,
      service,
    })

    const res = await fastify.inject({
      method: 'GET',
      url: '/queryParamObject?int1=1&int2=2',
    })
    assert.equal(res.statusCode, 200, 'status code ok')
  })
  await delay()
  setImmediate(() => {
    process.removeListener('warning', onWarning)
  })
  assert.deepEqual(calls, ['FSTOGDEP001'])
})
