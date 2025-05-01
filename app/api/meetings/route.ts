import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    // In a real app, we would get the user from the session/JWT
    // For now, we'll just return all meetings
    const meetings = await prisma.meeting.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
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
    const { title, description, startTime, endTime } = body;

    // Validate required fields
    if (!title || !startTime) {
      return NextResponse.json(
        { error: "Title and start time are required" },
        { status: 400 }
      );
    }

    // In a real app, we would get the user ID from the session/JWT
    // For now, we'll use a hardcoded user ID (make sure this user exists in your DB)
    const userId = 1;

    // Generate a unique meeting ID
    const meetingId = uuidv4();

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
        meetingId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        createdById: userId,
      },
    });

    // Add the creator as a participant and host
    await prisma.participant.create({
      data: {
        userId,
        meetingId: meeting.meetingId,
        isHost: true,
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