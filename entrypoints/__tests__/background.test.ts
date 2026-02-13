import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'

describe('background', () => {
  let listeners: Array<(...args: unknown[]) => void>

  beforeEach(() => {
    fakeBrowser.reset()
    vi.resetModules()
    listeners = []
    fakeBrowser.action.onClicked.addListener = vi.fn((cb) => {
      listeners.push(cb)
    })
  })

  it('registers listener on browser.action.onClicked', async () => {
    const mod = await import('../background')
    mod.default.main!()
    expect(fakeBrowser.action.onClicked.addListener).toHaveBeenCalled()
  })

  it('opens /visualizer.html in new tab when triggered', async () => {
    const createSpy = vi.fn()
    fakeBrowser.tabs.create = createSpy

    const mod = await import('../background')
    mod.default.main!()

    expect(listeners).toHaveLength(1)
    await listeners[0]()

    expect(createSpy).toHaveBeenCalledWith({
      url: fakeBrowser.runtime.getURL('/visualizer.html'),
    })
  })
})
