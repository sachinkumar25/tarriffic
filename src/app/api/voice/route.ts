import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse("Missing text input", { status: 400 });
    }

    const response = await client.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // voices: alloy, echo, fable, onyx, nova, and shimmer
      input: text,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
