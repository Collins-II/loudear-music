// app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Contact from "@/lib/database/models/contact";


// POST /api/contacts — create a new contact
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { heading, email, phone, subHeading, address } = body;

    if (!heading || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const contact = await Contact.create({ heading, email, phone, subHeading, address });
    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("[CONTACTS_POST_ERR]", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}

// GET /api/contacts — fetch all contacts or single by id
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let result;
    if (id) {
      result = await Contact.findById(id).lean();
      if (!result) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      }
    } else {
      result = await Contact.find().sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[CONTACTS_GET_ERR]", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts?id=123 — delete a contact
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing contact ID" }, { status: 400 });
    }

    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ success: true, address: "Contact deleted" });
  } catch (error) {
    console.error("[CONTACTS_DELETE_ERR]", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
