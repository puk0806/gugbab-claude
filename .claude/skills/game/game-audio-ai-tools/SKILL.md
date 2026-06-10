---
name: game-audio-ai-tools
description: >
  Unity 2D 모바일 게임의 BGM·SFX·NPC 보이스를 AI 도구로 생성하고 Unity에 임포트하는 전체 워크플로우.
  Suno / Meta AudioCraft / ElevenLabs / Bfxr 등 도구별 가격·라이선스·강점과 Unity AudioClip 임포트 최적화,
  FMOD 연동, 장르별 사운드 가이드까지 다룬다.
  <example>사용자: "Unity 2D 퍼즐 게임 BGM을 AI로 만들고 싶은데 어떤 도구를 써야 해?"</example>
  <example>사용자: "Suno로 만든 곡을 게임에 상업 배포해도 돼?"</example>
  <example>사용자: "모바일 게임 효과음 RAM 사용량 줄이는 Unity 임포트 설정 알려줘"</example>
---

# Unity 2D 모바일 게임 AI 사운드 생성 도구

> 소스: 각 섹션 하단 참조 URL
> 검증일: 2026-06-08
> 대상: Unity 2D 모바일 게임 (Android/iOS)

---

## 1. 도구 분류 — BGM vs SFX vs 보이스

| 용도 | 권장 도구 | 가격 모델 | 상업 사용 |
|------|-----------|-----------|-----------|
| **BGM (배경음악)** | Suno, ElevenLabs Music, Udio | 구독제 | 유료 플랜에서 허용 |
| **SFX (효과음, AI 생성)** | Meta AudioCraft AudioGen | 무료 (로컬 실행) | MIT 코드 / **CC-BY-NC 모델 가중치** |
| **SFX (레트로/픽셀)** | Bfxr / Jfxr / jsfxr | 무료 (웹) | 자유 사용 |
| **NPC 보이스 / TTS** | ElevenLabs TTS | 구독제 + 문자당 과금 | 유료 플랜에서 허용 |

> **주의:** AudioCraft는 *코드(MIT)*와 *모델 가중치(CC-BY-NC 4.0)*가 라이선스가 다르다. 사전 학습된 가중치 그대로의 출력은 **비상업** 라이선스로 간주될 수 있다. 상업 배포 시 자체 학습 모델로 재훈련하거나, 출력을 사용자가 충분히 가공해 파생 저작물로 만드는 방안을 검토한다.

---

## 2. 도구별 상세

### 2-1. Suno (BGM 메인)

**가격 (2026-06 기준):**

| 플랜 | 월 가격 | 연간 결제 시 | 크레딧 | 노래 수(곡당 약 5크레딧) | 상업 사용 |
|------|---------|--------------|--------|--------------------------|-----------|
| Free (Basic) | $0 | — | 50/일 (월 약 1500) | 약 10곡/일 | ❌ 금지 |
| Pro | $10/월 | $8/월 ($96/년) | 2,500/월 | 약 500곡 | ✅ 허용 |
| Premier | $30/월 | $24/월 ($288/년) | 10,000/월 | 약 2,000곡 | ✅ 허용 + Suno Studio |

- 구독 크레딧은 다음 달로 이월되지 않는다.
- 별도 구매한 탑업 크레딧은 만료 없으나, 사용하려면 활성 구독이 필요하다.
- v5.5 모델 사용 가능 (Pro 이상).

**프롬프트 패턴 — 게임 장르별:**

```
하이퍼캐주얼:
  "Upbeat 8-bit chiptune loop, 60 seconds, energetic, no vocals, BPM 130"

퍼즐:
  "Calm ambient piano with soft pad, looping 90 seconds, contemplative, no drums"

RPG/수집형 (보스):
  "Epic orchestral battle theme, brass and strings, 2 minutes, dramatic crescendo"

캐주얼 액션:
  "Energetic synthwave, retro arcade vibe, looping 80 seconds, BPM 140"
```

**상업 사용·저작권 주의 (게임 배포 핵심):**

- Pro/Premier 가입자는 **생성물 사용권**을 얻지만, 미국 저작권청은 **순수 AI 생성물에 저작권을 인정하지 않는다** (Thaler v. Perlmutter, 2026-03 대법원 cert. denied).
- 결과: 게임에 사용·수익화는 가능하지만, **타인이 동일 곡을 복제·재사용하는 것을 막을 권리는 없다**.
- 가사 작사·악기 연주 등 *인간 창작 요소*를 추가하면 그 부분에 한해 저작권 등록 가능성이 생긴다.
- WMG와 Suno는 2025-11 라이선스 합의, UMG·Sony는 2026-04 기준 소송 진행 중.

> 소스:
> - https://suno.com/pricing
> - https://help.suno.com/en/articles/2746945

---

### 2-2. Meta AudioCraft (SFX·BGM 로컬 생성)

오픈소스 PyTorch 기반 라이브러리. 텍스트 → 사운드/음악.

**구성 요소:**

| 모델 | 용도 |
|------|------|
| **AudioGen** | 텍스트 → 효과음/환경음 (개 짖는 소리, 발자국, 비, 폭발 등) |
| **MusicGen** | 텍스트 → 음악 |
| **MAGNeT** | 비-autoregressive 텍스트 → 음악/사운드 (더 빠름) |
| **EnCodec** | 신경망 오디오 코덱 (압축) |
| **AudioSeal** | 오디오 워터마킹 |

**라이선스 (반드시 분리해서 이해):**

- **코드**: MIT License (자유 상업 사용)
- **사전학습 모델 가중치**: CC-BY-NC 4.0 (비상업 한정)

> **주의:** 게임에 상업 배포하려면 (a) 자체 데이터로 모델을 재학습하거나, (b) 가중치 라이선스가 더 관대한 fork/체크포인트를 사용하거나, (c) 출력을 후처리·믹스해 파생 저작물로 만드는 방식을 검토해야 한다. 생성된 wav 파일을 그대로 게임에 넣어 판매하는 것은 라이선스 위반 소지가 있다.

**시스템 요구사항:**

- Python 3.9+
- PyTorch 2.1.0
- GPU 권장 (16GB VRAM 이상이면 large 모델 가능)

**설치:**

```bash
python -m pip install 'torch==2.1.0'
python -m pip install setuptools wheel
python -m pip install -U audiocraft
# ffmpeg 별도 설치 권장
```

**AudioGen 사용 (효과음 생성 예시):**

```python
from audiocraft.models import AudioGen
from audiocraft.data.audio import audio_write

model = AudioGen.get_pretrained('facebook/audiogen-medium')
model.set_generation_params(duration=3)  # 3초 효과음

descriptions = [
    'sword slash with metallic ring',
    'coin pickup chime',
    'monster growl in cave',
]

wav = model.generate(descriptions)
for idx, one_wav in enumerate(wav):
    audio_write(f'sfx_{idx}', one_wav.cpu(), model.sample_rate,
                strategy="loudness", loudness_compressor=True)
```

> 소스: https://github.com/facebookresearch/audiocraft

---

### 2-3. ElevenLabs (NPC 보이스 + Music v2)

**TTS (NPC 대사 메인 용도):**

- 과금 단위: 문자 1개 = 크레딧 1 (Multilingual v2 기준). Flash 모델은 0.5~1 크레딧/문자.
- 공백·구두점도 모두 카운트.
- Voice Cloning 자체는 무과금, 클로닝된 보이스로 TTS 생성할 때 문자 차감.
- 플랜별 클로닝 슬롯: Starter 3 / Creator 10 / Pro 30 / Scale 무제한.
- **게임 NPC 실시간 응답** → **Flash 모델** 사용 (저지연·저비용).

**Music (BGM 대안, 2025년 출시 → 2026 v2):**

- ElevenLabs Music v2는 **라이선스 확보 학습 데이터** 기반 → Suno/Udio와 달리 상업 사용 가능 영역이 더 명확.
- 유료 플랜 전부 상업 라이선스 포함.
- 단, **음원 스트리밍 플랫폼(Spotify/Apple Music 등) 배포는 어떤 플랜으로도 불가**.
- 영화/TV/대형 스튜디오 게임 권리는 **Enterprise 플랜** 필요.
- 모바일 인디 게임 BGM 용도는 일반 유료 플랜으로 충분.

**상업 라이선스 정리:**

| 항목 | ElevenLabs | Suno |
|------|-----------|------|
| 학습 데이터 라이선스 확보 여부 | ✅ 명시적 확보 | ⚠️ 소송 진행 중 (UMG/Sony) |
| 인디 게임 BGM 사용 | ✅ 가능 | ✅ 가능 (Pro 이상) |
| 대형 스튜디오 게임 | Enterprise 필요 | Pro/Premier로 가능 (단 저작권 보호 안 됨) |
| 스트리밍 플랫폼 배포 | ❌ 불가 | ⚠️ AI-friendly 배포사 필요 |

> 소스:
> - https://elevenlabs.io/pricing
> - https://elevenlabs.io/music-api
> - https://elevenlabs.io/blog/eleven-music-now-available-in-the-api

---

### 2-4. Bfxr / Jfxr / jsfxr (레트로 8비트 SFX)

**용도:** 픽셀아트·하이퍼캐주얼·캐주얼 게임의 즉시 생성 효과음 (점프, 코인, 폭발, UI 클릭).

**도구 비교:**

| 도구 | URL | 특징 |
|------|-----|------|
| **Bfxr** | https://www.bfxr.net/ | 원조 Sfxr 확장판. 웹/데스크탑 모두. WAV 또는 data URI export |
| **Jfxr** | https://jfxr.frozenfractal.com/ | Bfxr 영감 받은 브라우저 도구. 더 직관적 UI |
| **jsfxr (sfxr.me)** | https://sfxr.me/ | 원조 sfxr JS 포트. JS 라이브러리로도 게임 내 런타임 생성 가능 |

**전형적 사용 흐름:**

1. "Pickup/Coin", "Jump", "Laser/Shoot", "Explosion", "Hit/Hurt" 같은 프리셋 클릭
2. 슬라이더 조정으로 음높이·길이·envelope 조정
3. "Mutate" 버튼으로 변형 시도
4. WAV로 export → Unity로 드래그

이 도구들은 **저작권·상업 사용 제약이 사실상 없다** (도구 자체 출력은 절차적 합성 결과물). 대부분의 인디 게임이 이 방식으로 효과음을 만든다.

---

## 3. Unity 임포트 설정 (모바일 최적화)

### 3-1. 파일 포맷 워크플로우

```
AI 생성 (44.1kHz/48kHz stereo WAV)
   ↓ DAW에서 후처리 (Audacity, Reaper 등)
   - 노멀라이즈 (-1 dBFS)
   - 무음 트리밍
   - 필요 시 모노 변환
   - 루프 포인트 정렬 (BGM)
   ↓
WAV 마스터 (Unity 프로젝트의 Assets/Audio/_master/ 보관)
   ↓ Unity 임포트 (자동 Vorbis OGG 변환 — 모바일은 MP3로 인코딩됨)
```

### 3-2. Load Type 선택

| Load Type | 메모리 동작 | 용도 |
|-----------|-------------|------|
| **Decompress On Load** | 임포트 시 PCM으로 풀어 RAM에 적재 (Vorbis 기준 약 10배 메모리) | **짧은 SFX 반복 재생** (점프·UI 클릭, 200KB 이하 권장) |
| **Compressed In Memory** | 압축 상태로 RAM 적재 → 재생 시 CPU 디코딩 | **중간 길이 SFX 또는 가끔 재생하는 효과음** |
| **Streaming** | 디스크에서 스트리밍 (RAM 거의 사용 안 함) | **BGM, 긴 보이스 대사**. 모바일에서는 동시 스트리밍 1~2개 권장 |

> **모바일 주의:** Streaming은 동시 재생 수가 늘어나면 CPU·디스크 I/O 부하가 급증한다. 동시에 BGM 2곡 크로스페이드가 필요하면 한쪽은 메모리 로드로.

### 3-3. Compression Format

| Format | 압축비 | 용도 |
|--------|--------|------|
| **PCM** | 무압축 | 매우 짧은 고품질 SFX (50KB 이하) |
| **ADPCM** | 약 3.5배 | 반복 잡음 (발자국, 충돌음) |
| **Vorbis / MP3** | 약 10배 | BGM, 일반 SFX (Quality 슬라이더로 조정) |

> 모바일 플랫폼에서는 Unity가 Vorbis 설정을 **MP3 하드웨어 디코딩**으로 자동 변환한다 (Android/iOS 모두 MP3 디코딩 가속 지원).

### 3-4. 모바일 최적화 체크리스트

- [x] **Force To Mono**: SFX 대부분 활성화 (메모리·디스크 절반). BGM은 스테레오 유지가 일반적이지만, 폰 스피커가 모노라면 모노로도 충분
- [x] **Sample Rate Setting**: `Override Sample Rate` → SFX는 **22050 Hz**로 충분 (음성 대역). BGM은 44100 Hz 유지
- [x] **Quality 슬라이더 (Vorbis)**: SFX 60~70, BGM 70~80에서 시작 → 청감 OK면 더 낮춰 용량 줄임
- [x] **Platform Override**: Android·iOS 탭에서 개별 설정 — PC에디터는 빠른 디코드, 모바일은 작은 용량 우선
- [x] **Preload Audio Data**: BGM은 끄고(scene 시작 시 비동기 로드), 자주 쓰는 SFX는 켬

### 3-5. AudioMixer 채널 구조

권장 구조:

```
Master
├── BGM        (-6 dB ~ -3 dB 기준)
├── SFX        (-10 dB ~ -5 dB 기준)
├── Voice      (-6 dB ~ -3 dB, 가장 중요한 채널)
└── UI         (SFX와 분리하면 옵션에서 별도 조절 가능)
```

핵심 설정:

- **Send/Ducking**: Voice 그룹의 Duck Volume 효과 → BGM·SFX를 자동으로 -8 dB 정도 낮춰 대사 명료성 확보
- **노출 파라미터(Expose)**: 각 그룹의 Volume을 Exposed Parameters로 등록 → 설정 메뉴에서 `audioMixer.SetFloat("bgmVolume", Mathf.Log10(value) * 20f)`로 dB 변환 후 적용
- **Snapshot**: "Normal" / "Paused" / "BossFight" 등의 스냅샷으로 상황별 믹스 전환

```csharp
// 볼륨 슬라이더 → dB 변환 (Linear → Log)
public void SetBgmVolume(float linear01)
{
    float dB = linear01 > 0.0001f ? Mathf.Log10(linear01) * 20f : -80f;
    audioMixer.SetFloat("bgmVolume", dB);
}
```

> 소스:
> - https://docs.unity3d.com/Manual/class-AudioClip.html
> - https://docs.unity3d.com/Manual/AudioMixer.html

---

## 4. FMOD Studio 연동 (선택)

복잡한 반응형 사운드(상태 머신 BGM, 거리 기반 3D 사운드, 파라미터로 변하는 효과음)가 필요하면 FMOD 도입을 검토한다.

### 4-1. 라이선스

- **FMOD Free Indie License**: 연 수익 **$200K(USD) 미만**, 개발 예산 **$600K 미만**의 게임에 무료
- **FMOD for Unity 패키지**: Unity Verified Solution (Asset Store 무료 배포)
- 그 외 상용 라이선스는 별도 협의

### 4-2. Unity 기본 Audio 대비 장점

| 기능 | Unity Audio | FMOD |
|------|-------------|------|
| 반응형/적응형 BGM (parameter 기반 레이어 전환) | ❌ 직접 구현 | ✅ Studio에서 비주얼 편집 |
| 다중 사운드 인스턴스 자동 관리 | ⚠️ 수동 풀링 | ✅ Event 시스템 |
| 실시간 파라미터 (RPM, 속도 등) | ⚠️ 코드로 직접 | ✅ Automation |
| 디자이너-개발자 분업 | ❌ 어려움 | ✅ Studio가 사운드 디자이너용 도구 |
| 모바일 풋프린트 | 가벼움 | 약간 무거움 (수 MB 추가) |

### 4-3. 도입 기준

- 게임 규모가 작고 BGM 1~2곡 + SFX 30~50개 수준이면 → **Unity 기본 Audio + AudioMixer로 충분**
- 게임 상태에 따라 BGM 레이어가 변하거나, 50개 이상 SFX·동시 재생 인스턴스 관리가 필요하면 → **FMOD 도입 검토**

> 소스:
> - https://www.fmod.com/licensing
> - https://www.fmod.com/unity

---

## 5. 상업 라이선스 종합 비교

| 도구 | 코드/툴 라이선스 | 출력물 사용권 | 게임 상업 배포 |
|------|------------------|---------------|----------------|
| **Suno Free** | — | 비상업만 | ❌ |
| **Suno Pro/Premier** | — | 상업 라이선스 부여, 단 *저작권 보호 불가* | ✅ (소송 리스크 인지 필요) |
| **ElevenLabs (유료)** | — | 상업 라이선스, 학습 데이터 클리어 | ✅ (대형 스튜디오는 Enterprise) |
| **Meta AudioCraft** | MIT (코드) | CC-BY-NC (가중치) — *비상업* | ⚠️ 그대로 사용 시 라이선스 위반 가능 |
| **Bfxr/Jfxr/jsfxr** | 오픈소스 | 사실상 제약 없음 | ✅ |

**실무 권장 조합 (모바일 인디):**

```
BGM:    ElevenLabs Music (라이선스 안전) 또는 Suno Pro (선택지 다양)
SFX:    Bfxr/Jfxr (레트로) + 사운드 라이브러리(Freesound CC0) 혼용
NPC 보이스:  ElevenLabs Flash TTS
복잡 환경음: AudioCraft AudioGen → 후처리해서 사용 (자체 검토 필수)
```

---

## 6. 게임 장르별 사운드 가이드

### 6-1. 하이퍼캐주얼

- **BGM**: 30~60초 짧은 루프, 단순한 멜로디, BPM 120~140
- **SFX**: 경쾌·즉각적 피드백. 점수·콤보·실패 효과음이 핵심
- **도구**: Bfxr(SFX 빠르게) + Suno(BGM 단순 루프)
- **임포트**: 거의 모든 SFX `Decompress On Load` + `Force To Mono` + 22050 Hz

### 6-2. 퍼즐

- **BGM**: 차분한 앰비언트, 피아노/패드, 2~3분 루프
- **SFX**: 미니멀하게, 성공/실패 명확한 톤 대비
- **도구**: ElevenLabs Music (라이선스 안전) 또는 Suno + Bfxr UI 효과음
- **임포트**: BGM `Streaming`, SFX `Decompress On Load`

### 6-3. RPG / 수집형

- **BGM**: 웅장한 오케스트라, 전투/필드/마을 각각 다른 곡, 보스용 별도
- **SFX**: 다양한 무기·스킬·환경 사운드, 종류 풍부
- **NPC 보이스**: 캐릭터별 다른 보이스 (ElevenLabs voice cloning)
- **도구**: Suno Premier (대량) + AudioCraft AudioGen(환경음 자가 생성) + ElevenLabs TTS
- **임포트**: BGM `Streaming`, 자주 재생 SFX는 `Decompress`, 가끔 재생은 `Compressed In Memory`
- **FMOD 도입 검토**: 상태별 BGM 레이어 전환이 필요해질 수 있음

### 6-4. 캐주얼 액션 / 슈터

- **BGM**: 신스웨이브/일렉트로닉, 긴장감 있는 80~120초 루프
- **SFX**: 발사·피격·폭발이 핵심, 거리/방향 감각 위해 3D AudioSource 활용
- **도구**: Suno + AudioCraft AudioGen(폭발·기계음)
- **임포트**: 동시 재생 많은 SFX는 `Compressed In Memory`로 RAM 절약, AudioMixer에서 SFX 그룹 제한

---

## 7. 흔한 실수 패턴

- ❌ **AudioCraft 가중치로 만든 사운드를 상업 게임에 그대로 사용** → CC-BY-NC 위반 가능
- ❌ **Suno Free 플랜으로 만든 BGM을 출시 게임에 사용** → 라이선스 위반
- ❌ **모든 SFX를 `Streaming`으로 설정** → 모바일 CPU 부하 폭증, 첫 재생 지연
- ❌ **BGM을 `Decompress On Load`로 설정** → RAM 10배 증가
- ❌ **44.1 kHz 스테레오로 모든 SFX 임포트** → 디스크/RAM 4배 낭비
- ❌ **AudioMixer Volume을 Linear 슬라이더값 그대로 SetFloat** → 음량 인지가 비선형. `Mathf.Log10(value) * 20f`로 dB 변환 필수
- ❌ **NPC 보이스를 매번 런타임 TTS 호출** → 비용·지연 모두 폭증. 사전 생성 + 캐싱이 기본
- ❌ **WAV 마스터를 보관하지 않고 OGG만 보관** → 재변환·재편집 불가

---

## 8. 빠른 의사결정 플로우

```
Q. 어떤 사운드를 만들어야 하는가?

→ 60초 이상 BGM
   → 인디 / 인디 모바일: ElevenLabs Music (라이선스 안전) or Suno Pro
   → 대형 스튜디오: ElevenLabs Enterprise

→ 짧은 효과음 (점프, 코인, UI)
   → 픽셀/레트로: Bfxr/Jfxr (무료, 즉시)
   → 모던: AudioCraft AudioGen (후처리 필수) or 사운드 라이브러리

→ NPC 대사 / 보이스오버
   → 미리 생성: ElevenLabs Multilingual v2
   → 실시간 응답: ElevenLabs Flash

→ 적응형/반응형 음악 시스템 필요
   → FMOD Studio 도입 검토 (인디 무료)
```
