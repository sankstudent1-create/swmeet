import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient, TrackSource } from "livekit-server-sdk";

const roomService = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, room, identity, trackSid, role } = body;

    if (action === "mute") {
      if (!trackSid) return NextResponse.json({ error: "Missing trackSid" }, { status: 400 });
      await roomService.mutePublishedTrack(room, identity, trackSid, true);
      return NextResponse.json({ success: true });
    }
    
    if (action === "end") {
      await roomService.deleteRoom(room);
      return NextResponse.json({ success: true });
    }
    
    if (action === "update-role") {
      const permissions = {
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canPublishSources: role === 'moderator' ? undefined : [TrackSource.MICROPHONE, TrackSource.CAMERA]
      };
      await roomService.updateParticipant(room, identity, undefined, permissions);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("LiveKit Admin Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
