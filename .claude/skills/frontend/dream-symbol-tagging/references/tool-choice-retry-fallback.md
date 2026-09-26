# tool_choice 재시도·에러 폴백 (SKILL.md §6-2 부속)

> 소스: https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/core/error.ts (`APIError`/`BadRequestError`, status 400 분기)
> 검증일: 2026-09-26

SKILL.md §6-2(`tool_choice: auto` + `strict: true`)를 실제 파이프라인에 넣을 때 필요한 두 가지 보강 — 미호출 시 재시도, 강제 `tool_choice` 400 에러 폴백 — 을 다룬다.

---

## 1. `auto`에서 도구 미호출 시 재시도

`tool_choice: auto`는 호출 자체를 보장하지 않으므로, 미호출을 1회성 실패로 버리지 않고 **제한된 횟수만 재시도**한 뒤 그래도 실패하면 §6-3 fallback(룰 기반 결과만 사용)으로 넘긴다. 무한 재시도는 지연·비용만 늘리므로 상한을 반드시 둔다.

```ts
const MAX_TOOL_CALL_RETRIES = 2; // 최초 1회 + 재시도 2회 = 최대 3회 API 호출

export async function llmExtractViaToolWithRetry(dreamText: string): Promise<ExtractedSymbol[]> {
  for (let attempt = 0; attempt <= MAX_TOOL_CALL_RETRIES; attempt++) {
    const res = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      tools: [symbolExtractTool],
      tool_choice: { type: "auto" },
      messages: [
        {
          role: "user",
          content: attempt === 0
            ? `extract_dream_symbols 도구를 사용해 다음 꿈 텍스트의 상징을 추출하세요. 해석은 하지 말고 표면 표현과 카테고리만 분류합니다.\n\n${dreamText}`
            // 재시도 시에는 도구 사용을 더 직접적으로 재지시한다 (모델·스키마는 그대로, 프롬프트만 강화)
            : `반드시 extract_dream_symbols 도구를 호출해서 답하세요. 텍스트로 직접 답하지 마세요.\n\n${dreamText}`,
        },
      ],
    });

    const toolBlock = res.content.find((c) => c.type === "tool_use");
    if (toolBlock?.type === "tool_use") return safeParseSymbols(toolBlock.input);
    // 미호출 — 마지막 시도가 아니면 루프를 계속하고, 마지막 시도면 아래에서 빈 배열 반환
  }
  return []; // 최종 폴백: §6-3과 동일하게 룰 기반 결과만 사용
}
```

---

## 2. 강제 `tool_choice`가 400을 반환할 때의 폴백

모델을 설정값으로 주입해 동적으로 바꾸는 파이프라인이라면, 강제 `tool_choice`를 Opus 5.5·Fable 5.1에 실수로 보낼 가능성을 코드로 차단해야 한다. Anthropic TypeScript SDK는 4xx/5xx를 `Anthropic.APIError` 서브클래스로 던지며, 400은 `Anthropic.BadRequestError`다(`src/core/error.ts`의 `APIError.generate`가 `status`로 분기 — 공식 GitHub 확인).

```ts
import Anthropic from "@anthropic-ai/sdk";

async function llmExtractForcedWithFallback(
  dreamText: string,
  model: string, // 설정값으로 주입되는 모델 ID — opus-5-5·fable-5-1일 수 있음
): Promise<ExtractedSymbol[]> {
  try {
    const res = await client.messages.create({
      model,
      max_tokens: 1024,
      tools: [symbolExtractTool],
      tool_choice: { type: "tool", name: "extract_dream_symbols" }, // Sonnet 5·Haiku 4.5 등에서만 유효
      messages: [{ role: "user", content: `extract_dream_symbols 도구를 사용해 다음 꿈 텍스트의 상징을 추출하세요.\n\n${dreamText}` }],
    });
    const toolBlock = res.content.find((c) => c.type === "tool_use");
    return toolBlock?.type === "tool_use" ? safeParseSymbols(toolBlock.input) : [];
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError) {
      // Opus 5.5·Fable 5.1처럼 강제 tool_choice를 지원하지 않는 모델 — auto+재시도 경로로 폴백
      console.warn(`[dream-symbol-tagging] forced tool_choice rejected (model=${model}) — falling back to auto`, err.message);
      return llmExtractViaToolWithRetry(dreamText);
    }
    throw err; // 400 외(인증·rate limit 등)는 그대로 전파 — 조용히 삼키지 않는다
  }
}
```

> `err.status`(숫자 400)와 `err.name`(`"BadRequestError"`)도 함께 확인 가능하지만, `instanceof Anthropic.BadRequestError`가 SDK가 이미 status로 분기해 둔 결과라 가장 명확하다. 400을 "강제 tool_choice 미지원"으로 단정하지 않으려면 `err.message`에 `tool_choice`가 언급되는지 로그로 남겨 다른 400 원인(스키마 오류 등)과 구분한다.
