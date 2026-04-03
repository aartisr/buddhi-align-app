import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiFetch, APIClientError, API_CONFIG } from "@buddhi-align/site-config";

describe("apiFetch", () => {
  let fetchSpy: any;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchSpy = vi.fn();
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      configurable: true,
      writable: true,
    });
  });

  it("returns data on successful fetch", async () => {
    const mockData = { id: "1", name: "Test" };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: vi.fn().mockReturnValue(null) },
      json: vi.fn().mockResolvedValueOnce(mockData),
    });

    const result = await apiFetch("/api/test");
    expect(result).toEqual(mockData);
  });

  it("throws APIClientError on network failure after retries", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));

    await expect(apiFetch("/api/test")).rejects.toThrow(APIClientError);
    expect(fetchSpy).toHaveBeenCalledTimes(API_CONFIG.retries);
  });

  it("throws APIClientError on 404 response", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(apiFetch("/api/test")).rejects.toThrow(APIClientError);
  });

  it("retries on 500 server error", async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: vi.fn().mockReturnValue(null) },
        json: vi.fn().mockResolvedValueOnce({ success: true }),
      });

    const result = await apiFetch("/api/test");
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("respects timeout", async () => {
    let abortSignal: AbortSignal | undefined;
    fetchSpy.mockImplementation((_: any, opts: any) => {
      abortSignal = opts.signal;
      return new Promise(() => {}); // Never resolves
    });

    const timeoutPromise = apiFetch("/api/test", { timeout: 100 });
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(abortSignal?.aborted).toBe(true);
  });

  it("includes Content-Type header", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: vi.fn().mockReturnValue(null) },
      json: vi.fn().mockResolvedValueOnce({}),
    });

    await apiFetch("/api/test");

    const call = fetchSpy.mock.calls[0];
    expect(call[1].headers["Content-Type"]).toBe("application/json");
  });
});
