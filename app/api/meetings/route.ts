import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    // In a real app, we would get the user from the session/JWT
    // For now, we'll just return all meetings
    const meetings = await prisma.meeting.findMany({
      include: {
        creator: {
          select: {
            id: true,
            display_name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startTime } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // In a real app, we would get the user ID from the session/JWT
    // For now, we'll use a hardcoded user ID (make sure this user exists in your DB)
    const userId = 1;

    // Generate a unique meeting ID
    const meeting_id = uuidv4().substring(0, 8);

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
        meeting_id,
        name: title,
        description,
        created_by: userId,
        is_recording: false,
      },
    });

    // Add the creator as a participant and host
    await prisma.participant.create({
      data: {
        user_id: userId,
        meeting_id: meeting.meeting_id,
        is_host: true,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}