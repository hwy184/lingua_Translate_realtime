import logging
import json
import asyncio
from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import google, silero

load_dotenv()
logger = logging.getLogger("lingua-s2s-agent")

TRANSLATE_PROMPT = (
    "You are a professional real-time interpreter.\n"
    "Rules:\n"
    "- If input is Vietnamese → translate to English ONLY.\n"
    "- If input is English → translate to Vietnamese ONLY.\n"
    "- Output the translated sentence ONLY. No greeting, no explanation."
)


async def entrypoint(ctx: JobContext):
    logger.info(f"[Lingua] Kết nối vào phòng: {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    stt_engine = google.STT(
        languages=["vi-VN", "en-US"],
        detect_language=True,
        interim_results=False,
    )
    tts_engine = google.TTS(voice_name="vi-VN-Wavenet-C")
    llm_engine = google.LLM(model="gemini-2.0-flash")

    # Track âm thanh để agent phát bản dịch
    audio_source = rtc.AudioSource(sample_rate=24000, num_channels=1)
    track = rtc.LocalAudioTrack.create_audio_track("translator", audio_source)
    await ctx.room.local_participant.publish_track(
        track, rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
    )

    def send_message(msg: dict):
        """Broadcast dữ liệu chat tới tất cả participants trên frontend."""
        ctx.room.local_participant.publish_data(
            json.dumps(msg, ensure_ascii=False).encode("utf-8"),
            reliable=True,
            topic="lingua_chat",
        )

    async def translate_and_speak(text: str, speaker: str):
        logger.info(f"[Lingua] 🎙️ {speaker}: {text}")

        # Gửi transcript gốc lên frontend
        send_message({"type": "transcript", "speaker": speaker, "text": text})

        # Dịch bằng Gemini
        from livekit.agents import llm as agents_llm
        chat_ctx = agents_llm.ChatContext().append(
            role="system", text=TRANSLATE_PROMPT
        ).append(role="user", text=text)

        chat = llm_engine.chat(chat_ctx=chat_ctx)
        translation = ""
        async for chunk in chat:
            if chunk.choices and chunk.choices[0].delta.content:
                translation += chunk.choices[0].delta.content

        translation = translation.strip()
        logger.info(f"[Lingua] 🔄 Bản dịch: {translation}")

        if not translation:
            return

        # Gửi bản dịch lên frontend
        send_message({"type": "translation", "speaker": speaker, "text": translation})

        # Phát âm thanh bản dịch
        async for audio in tts_engine.synthesize(translation):
            await audio_source.capture_frame(audio.frame)

    async def handle_participant(participant: rtc.RemoteParticipant):
        if participant.identity.startswith("agent_"):
            return
        logger.info(f"[Lingua] 👤 Đang lắng nghe: {participant.name or participant.identity}")

        async def process_track(track: rtc.Track):
            if track.kind != rtc.TrackKind.KIND_AUDIO:
                return

            audio_stream = rtc.AudioStream(track)
            stt_stream = stt_engine.stream()

            async def push_audio():
                async for event in audio_stream:
                    await stt_stream.push_frame(event.frame)

            from livekit.agents import stt as agents_stt
            async def pull_transcript():
                async for event in stt_stream:
                    if hasattr(event, "type") and event.type == agents_stt.SpeechEventType.FINAL_TRANSCRIPT:
                        if event.alternatives:
                            text = event.alternatives[0].text.strip()
                            if text:
                                await translate_and_speak(
                                    text, participant.name or participant.identity
                                )

            await asyncio.gather(push_audio(), pull_transcript())

        def on_track_subscribed(track, *_):
            asyncio.ensure_future(process_track(track))

        participant.on("track_subscribed", on_track_subscribed)

        for pub in participant.track_publications.values():
            if pub.track:
                asyncio.ensure_future(process_track(pub.track))

    for p in ctx.room.remote_participants.values():
        asyncio.ensure_future(handle_participant(p))

    @ctx.room.on("participant_connected")
    def on_new_participant(participant: rtc.RemoteParticipant):
        asyncio.ensure_future(handle_participant(participant))

    logger.info("[Lingua] 🚀 Agent sẵn sàng!")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
