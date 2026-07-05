import { NextRequest, NextResponse } from "next/server";
import { AccessToken, TrackSource } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  const role = req.nextUrl.searchParams.get("role") || "participant";

  if (!room || !username) {
    return NextResponse.json(
      { error: "Missing 'room' or 'username' parameter" },
      { status: 400 }
    );
  }

  if (role === "waiting") {
    return NextResponse.json(
      { error: "Waiting for host to admit you.", waiting: true },
      { status: 403 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  
  if (!apiKey || !apiSecret || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: "Server missing LiveKit credentials." },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    metadata: JSON.stringify({ role }), // Send role in token metadata
  });

  const isHostOrMod = role === "host" || role === "moderator";

  // Set the permissions for this token
  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
    roomAdmin: isHostOrMod,
    // Block standard users from screen sharing
    canPublishSources: isHostOrMod ? undefined : [
      TrackSource.MICROPHONE, 
      TrackSource.CAMERA
    ],
  });

  const token = await at.toJwt();
  
  return NextResponse.json({ token });
}
