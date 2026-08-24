import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({
  ENV: {
    forgeApiUrl: "https://forge.example.test",
    forgeApiKey: "test-managed-key",
  },
}));

import { invokeLLM } from "./llm";

describe("invokeLLM", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("uses GPT-compatible completion-token control without a legacy token cap", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "test-response",
      created: 0,
      model: "gpt-5-mini",
      choices: [{ index: 0, message: { role: "assistant", content: "Grounded answer" }, finish_reason: "stop" }],
    }), { status: 200 }));
    globalThis.fetch = fetchMock;

    await invokeLLM({
      model: "gpt-5-mini",
      maxCompletionTokens: 900,
      messages: [{ role: "user", content: "Summarise this scan." }],
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.max_completion_tokens).toBe(900);
    expect(payload.max_tokens).toBeUndefined();
    expect(payload.model).toBe("gpt-5-mini");
  });
});
