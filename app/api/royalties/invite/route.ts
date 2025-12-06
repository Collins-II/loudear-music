import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/database";
import RoyaltySplit from "@/lib/database/models/royalty-splits";


export async function POST(req: Request) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const { splitId } = await req.json();
if (!splitId) return NextResponse.json({ error: "splitId required" }, { status: 400 });


const split = await RoyaltySplit.findById(splitId);
if (!split) return NextResponse.json({ error: "Split not found" }, { status: 404 });
if (split.ownerId.toString() !== user._id.toString()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });


// create invite token
const token = crypto.randomBytes(24).toString("hex");
split.inviteToken = token;
await split.save();


// send email (configure transporter via env)
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: Boolean(process.env.SMTP_SECURE === "true"),
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});


const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/royalties/accept?token=${token}`;
await transporter.sendMail({
from: process.env.SMTP_FROM,
to: split.collaboratorEmail,
subject: `You're invited to accept royalty splits for a track on LoudEar`,
text: `Hi ${split.collaboratorName},\n\nYou've been invited to accept a royalty split for a track. Please sign up or login and visit: ${acceptUrl}\n\nIf you already have an account, sign in then open the link.`,
html: `<p>Hi ${split.collaboratorName},</p><p>You've been invited to accept a royalty split for a track. Please <a href="${acceptUrl}">click here</a>. If you don't have an account, sign up and then open the same link.</p>`,
});


return NextResponse.json({ success: true });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}