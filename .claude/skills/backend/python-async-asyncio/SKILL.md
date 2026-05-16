---
name: python-async-asyncio
description: >
  Python asyncio + async/await 패턴을 FastAPI·LLM API 호출 등 I/O 바운드 백엔드 작업에 사용할 때 참조한다.
  이벤트 루프 / Task / Gather / TaskGroup / Semaphore / Timeout / 취소 / async 컨텍스트 매니저 / async 제너레이터 / blocking call 회피.
  <example>사용자: "FastAPI 엔드포인트에서 외부 API 5개를 동시에 호출하려면?"</example>
  <example>사용자: "동기 라이브러리(sync DB driver)를 async 함수에서 호출해야 하는데 이벤트 루프가 막혀요"</example>
  <example>사용자: "asyncio.wait_for랑 asyncio.timeout 중에 뭘 써야 하나요?"</example>
---

# Python asyncio + async/await 패턴

> 소스: https://docs.python.org/3/library/asyncio-task.html · https://docs.python.org/3/library/asyncio-sync.html · https://peps.python.org/pep-0492/ · https://peps.python.org/pep-0525/ · https://www.python-httpx.org/async/
> 검증일: 2026-05-15
> 대상 버전: Python 3.11 / 3.12 (3.11+ 권장 — `asyncio.timeout`, `TaskGroup` 사용)
> 짝 스킬: `backend/python-fastapi`, `backend/python-anthropic-sdk`

---

## 1. async/await 기본

### 코루틴 정의·실행

```python
import asyncio

async def fetch_user(user_id: int) -> dict:
    # await: 다른 코루틴이 끝날 때까지 양보 (이벤트 루프 차단 X)
    await asyncio.sleep(0.1)
    return {"id": user_id, "name": "Alice"}

async def main():
    user = await fetch_user(1)
    print(user)

# 최상위 진입점: asyncio.run() — 이벤트 루프 생성·정리까지 자동
asyncio.run(main())
```

**핵심 규칙:**
- `async def`로 정의된 함수를 호출하면 **즉시 실행되지 않고 코루틴 객체를 반환**한다. 실행하려면 `await`하거나 Task로 스케줄해야 한다.
- `await`는 `async def` 안에서만 사용 가능 (sync 함수 안에서 `await` 시 SyntaxError).
- 이벤트 루프는 **싱글 스레드**다. CPU 바운드 작업이나 blocking I/O가 들어가면 모든 코루틴이 멈춘다.

> 주의: `asyncio.run()`은 한 프로세스에서 이미 이벤트 루프가 돌고 있는 환경(Jupyter, FastAPI 핸들러 내부)에서는 호출하지 말 것. 이미 루프가 있으면 `await`만 쓰거나 `asyncio.create_task()`로 스케줄.

---

## 2. 동시 실행 — gather / create_task / TaskGroup

### asyncio.gather() — 여러 awaitable 동시 실행

```python
async def main():
    # 3개를 동시에 실행하고 모두 끝날 때까지 대기. 반환 순서는 입력 순서와 동일.
    results = await asyncio.gather(
        fetch_user(1),
        fetch_user(2),
        fetch_user(3),
    )
    # 예외가 나면 즉시 전파. 다른 예외도 결과로 받고 싶다면 return_exceptions=True
    results = await asyncio.gather(*coros, return_exceptions=True)
```

### asyncio.create_task() — 백그라운드 스케줄

```python
async def main():
    task = asyncio.create_task(fetch_user(1))  # 즉시 스케줄, 아직 await X
    # 다른 일을 먼저...
    other = await fetch_user(2)
    user = await task  # 여기서 결과 회수
```

> 주의 (Python 3.7+): `create_task()`로 만든 Task는 **참조를 유지해야** 한다. 변수에 담지 않으면 GC가 중간에 회수해 작업이 사라질 수 있다. 백그라운드 작업이면 set에 보관하고 `add_done_callback`으로 제거.

### asyncio.TaskGroup() (Python 3.11+) — 구조적 동시성, 권장

```python
async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch_user(1))
        t2 = tg.create_task(fetch_user(2))
    # 컨텍스트 종료 시점에 모든 Task가 자동으로 await됨
    # 하나라도 예외가 나면 나머지는 자동 취소 → ExceptionGroup으로 전파
    print(t1.result(), t2.result())
```

**언제 무엇을 쓰나:**
- 결과만 묶어서 받으면 됨 → `gather`
- 일부 실패 시 나머지 자동 취소·예외 묶어서 처리 → `TaskGroup` (3.11+ 권장)
- 백그라운드로 흘려보내고 나중에 결과 회수 → `create_task`

---

## 3. 동기 함수를 비동기에서 호출 — to_thread / run_in_executor

이벤트 루프는 싱글 스레드라서 **blocking call** (예: `requests.get`, `time.sleep`, sync DB 드라이버)을 그대로 부르면 모든 코루틴이 멈춘다. 별도 스레드로 보내야 한다.

### asyncio.to_thread() (Python 3.9+) — 권장

```python
import time

def blocking_io():
    time.sleep(2)  # blocking
    return "done"

async def main():
    # 별도 스레드에서 실행, 이벤트 루프는 계속 다른 코루틴 처리
    result = await asyncio.to_thread(blocking_io)
```

### loop.run_in_executor() — 커스텀 executor 필요할 때

```python
from concurrent.futures import ProcessPoolExecutor

async def main():
    loop = asyncio.get_running_loop()
    # ThreadPoolExecutor 외에 ProcessPoolExecutor도 가능 (CPU 바운드)
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, cpu_bound_func, arg)
```

**선택 기준:**
- 단순 I/O blocking → `asyncio.to_thread()` (기본 ThreadPoolExecutor 사용, API 깔끔)
- CPU 바운드 → `ProcessPoolExecutor` + `run_in_executor()`
- 커스텀 pool 크기·재사용 → `run_in_executor()`

> 주의: `to_thread`/`run_in_executor`는 **GIL을 우회하지 않는다**. CPU 바운드에는 ProcessPoolExecutor를 쓰거나 free-threaded Python 빌드를 사용.

---

## 4. httpx.AsyncClient — async HTTP 클라이언트 (requests 대체)

`requests`는 sync 전용이라 async 함수에서 그대로 부르면 이벤트 루프가 막힌다. **httpx**를 사용한다.

```python
import httpx

async def main():
    # 단발성 호출
    async with httpx.AsyncClient() as client:
        r = await client.get("https://example.com/api")
        print(r.json())

# 여러 호출 동시
async def fetch_all(urls: list[str]) -> list[dict]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]
```

### 타임아웃 세분화

```python
# connect / read / write / pool 각각 지정 가능
timeout = httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)
async with httpx.AsyncClient(timeout=timeout) as client:
    ...
```

httpx 기본 타임아웃은 **5초 (네트워크 무응답 시 `TimeoutException`)**. 명시하지 않아도 무한 대기는 안 됨.

### 스트리밍 응답 (LLM 응답 등)

```python
async with client.stream("GET", url) as response:
    async for chunk in response.aiter_bytes():
        process(chunk)
```

> 주의: AsyncClient는 **재사용**한다. 매 요청마다 `async with httpx.AsyncClient()`를 새로 만들면 connection pool 이점을 잃는다. FastAPI에서는 lifespan/dependency에서 단일 인스턴스 공유.

---

## 5. 동시성 제어 — Semaphore / Queue

### asyncio.Semaphore — 동시 실행 수 제한 (rate limit, 외부 API 429 방지)

```python
async def fetch_with_limit(client, url, sem):
    async with sem:  # 동시에 5개까지만 진입
        return await client.get(url)

async def main():
    sem = asyncio.Semaphore(5)
    async with httpx.AsyncClient() as client:
        tasks = [fetch_with_limit(client, url, sem) for url in urls]
        results = await asyncio.gather(*tasks)
```

### asyncio.Queue — 생산자/소비자 패턴

```python
async def producer(queue: asyncio.Queue):
    for item in items:
        await queue.put(item)
    await queue.put(None)  # 종료 신호

async def consumer(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        await process(item)
        queue.task_done()

async def main():
    queue = asyncio.Queue(maxsize=100)
    await asyncio.gather(producer(queue), consumer(queue))
```

**참고:** `asyncio.Lock`, `asyncio.Event`, `asyncio.Condition`도 같은 패턴 (`async with lock:`).

> 주의: `threading.Lock` / `queue.Queue`는 sync 전용이다. async 코드에는 반드시 `asyncio.*` 버전을 쓴다.

---

## 6. 타임아웃 — asyncio.timeout() vs asyncio.wait_for()

### asyncio.timeout() (Python 3.11+) — 권장

```python
try:
    async with asyncio.timeout(10):
        # 블록 안의 모든 await가 10초 안에 끝나야 함
        data = await fetch_user(1)
        more = await fetch_user(2)
        # await가 여러 개여도 OK
except TimeoutError:
    print("10초 초과")
```

**장점:**
- 여러 await를 한 블록으로 묶을 수 있음
- 새 Task를 만들지 않아 `wait_for`보다 빠름
- `when()`/`reschedule()`로 데드라인 동적 조정 가능

### asyncio.wait_for() — 단일 awaitable, 3.11 이전 호환

```python
try:
    result = await asyncio.wait_for(fetch_user(1), timeout=10)
except TimeoutError:  # Python 3.11+: 표준 TimeoutError (asyncio.TimeoutError와 통합)
    print("timeout")
```

> 주의: Python 3.10 이하에서는 `asyncio.TimeoutError`를 catch해야 한다. 3.11부터 `asyncio.TimeoutError`가 표준 `TimeoutError`의 alias로 통합되어 둘 다 잡힌다.

---

## 7. Task 취소 — task.cancel() / CancelledError

```python
async def long_task():
    try:
        await asyncio.sleep(3600)
    except asyncio.CancelledError:
        print("정리 작업 수행")
        raise  # 반드시 재발생시켜 취소를 전파
    finally:
        print("finally는 항상 실행")

async def main():
    task = asyncio.create_task(long_task())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("취소 확인")
```

**핵심 규칙:**
- `CancelledError`는 `BaseException` 하위 (3.8+). `except Exception:`으로 잡히지 않음 — **의도된 설계**다.
- 잡고 정리하는 건 OK. 단 **반드시 `raise`로 재전파**해야 한다. 잡고 삼키면 cancel이 무시되어 구조적 동시성 깨짐.
- `asyncio.shield(coro)`로 부분 보호 가능.

> 주의: `task.cancel()`은 **요청**일 뿐 즉시 종료가 아니다. 다음 이벤트 루프 사이클에서 `CancelledError`가 주입된다. blocking 코드 안이면 취소가 늦어진다.

---

## 8. 비동기 컨텍스트 매니저 — async with / `__aenter__` / `__aexit__`

PEP 492 — `async with`는 진입·종료 양쪽이 awaitable인 컨텍스트 매니저.

```python
class AsyncDBConnection:
    async def __aenter__(self):
        self.conn = await connect_db()  # await 가능
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.conn.close()  # 종료도 await 가능
        return False  # 예외 억제 안 함

async def main():
    async with AsyncDBConnection() as db:
        await db.query("SELECT 1")
```

표준 라이브러리 도우미:

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan():
    resource = await acquire()
    try:
        yield resource
    finally:
        await release(resource)

async def main():
    async with lifespan() as r:
        ...
```

> 주의: `async with`는 반드시 `async def` 함수 내부에서만 사용 가능 (SyntaxError).

---

## 9. 비동기 제너레이터 — async for / `__aiter__` / `__anext__`

PEP 525 — `yield`로 값을 흘려보내는 async 함수.

```python
async def ticker(delay: float, to: int):
    for i in range(to):
        yield i
        await asyncio.sleep(delay)

async def main():
    async for value in ticker(1.0, 5):
        print(value)
```

수동 프로토콜 구현이 필요할 때:

```python
class AsyncCounter:
    def __init__(self, limit):
        self.i = 0
        self.limit = limit

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)
        self.i += 1
        return self.i
```

**활용:** LLM 스트리밍 응답, DB 결과 페이지네이션, 큐 소비 등 "끝이 정해진 비동기 시퀀스" 모델링.

---

## 10. 흔한 함정

### 함정 1: blocking call을 async 함수에서 그대로 부르기

```python
# 금지 — 이벤트 루프 전체가 1초 멈춤
async def bad():
    time.sleep(1)
    requests.get("https://api.example.com")  # sync 호출

# 권장
async def good():
    await asyncio.sleep(1)
    async with httpx.AsyncClient() as client:
        await client.get("https://api.example.com")

# 부득이 sync 라이브러리를 써야 할 때
async def fallback():
    await asyncio.to_thread(requests.get, "https://api.example.com")
```

### 함정 2: sync 함수 안에서 `await`

```python
# SyntaxError
def sync_func():
    await fetch_user(1)  # async def 안에서만 가능

# 굳이 sync 컨텍스트에서 async를 부르려면 asyncio.run()
def sync_func():
    return asyncio.run(fetch_user(1))  # 새 이벤트 루프 (이미 루프 있으면 RuntimeError)
```

### 함정 3: 코루틴을 await 없이 호출

```python
# 실행 안 됨 — RuntimeWarning: coroutine was never awaited
fetch_user(1)

# 권장
await fetch_user(1)
# 또는
task = asyncio.create_task(fetch_user(1))
```

### 함정 4: create_task 결과를 변수에 안 담기

```python
# 위험 — GC가 Task를 회수해서 작업이 중간에 사라질 수 있음
asyncio.create_task(background_work())

# 권장
background_tasks: set[asyncio.Task] = set()

def schedule(coro):
    task = asyncio.create_task(coro)
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
```

### 함정 5: `asyncio.run()`을 여러 번 호출

```python
# 금지 — 이미 루프가 도는 환경에서 또 호출하면 RuntimeError
async def handler():
    asyncio.run(other_coro())  # FastAPI 핸들러 안에서 이렇게 쓰면 안 됨

# 권장 — 이미 있는 루프 위에서 그냥 await
async def handler():
    await other_coro()
```

### 함정 6: CancelledError 삼키기

```python
# 금지 — 취소가 무시되어 부모 TaskGroup·timeout이 깨짐
async def bad():
    try:
        await something()
    except asyncio.CancelledError:
        pass  # 삼키면 안 됨

# 권장
async def good():
    try:
        await something()
    except asyncio.CancelledError:
        await cleanup()
        raise  # 반드시 재전파
```

---

## 11. Python 3.12+ 개선 사항

- **asyncio 성능 대폭 개선**: 일부 벤치마크 ~75% 속도 향상 (Task 생성, `current_task()` C 구현, 소켓 쓰기 최적화).
- **Eager Task Factory**: `loop.set_task_factory(asyncio.eager_task_factory)` 설정 시 코루틴이 Task 생성 시점에 동기적으로 시작되어, blocking 없이 끝나면 루프 스케줄 비용을 건너뜀 (use case에 따라 2~5배 빨라짐).
- **3.13**: `as_completed()`가 async iterator로도 사용 가능. `task.uncancel()`이 카운트 0일 때 대기 중 취소를 무효화.
- **3.14**: `create_task(eager_start=True)` 지원.

> 주의: Python 3.11과 3.12 사이에 일부 asyncio 동작(특히 eager execution 관련)이 바뀌어 코드 동작이 달라질 수 있다. 라이브러리 업그레이드 시 회귀 테스트 권장.

---

## 12. FastAPI / LLM API 호출 컨텍스트에서의 적용 요약

| 상황 | 권장 패턴 |
|------|----------|
| 외부 API N개 동시 호출 | `asyncio.gather(*tasks)` + `httpx.AsyncClient` 단일 인스턴스 |
| 외부 API rate limit 회피 | `asyncio.Semaphore(N)` + `async with sem:` |
| LLM 스트리밍 응답 | `client.stream(...)` + `async for chunk in r.aiter_bytes()` |
| sync DB 드라이버 호출 | `asyncio.to_thread(query_func, ...)` |
| 전체 요청 타임아웃 | `async with asyncio.timeout(30):` (3.11+) |
| 일부 실패 시 나머지 자동 취소 | `asyncio.TaskGroup()` (3.11+) |
| 백그라운드 작업 | `create_task()` + set에 참조 보관 |
| FastAPI lifespan 자원 관리 | `@asynccontextmanager` |

자세한 FastAPI 통합 패턴은 `backend/python-fastapi`, Anthropic SDK 비동기 호출은 `backend/python-anthropic-sdk` 참조.
