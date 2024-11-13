class Security {
  async goodAuthCheck () {
    // Do nothing--auth check succeeds!
  }

  async failingAuthCheck () {
    throw new Error('API key was invalid or not found')
  }

  async failingAuthCheckCustomStatusCode () {
    const err = new Error('API key was invalid or not found')
    err.statusCode = 451
    throw err
  }
}

export default new Security()
