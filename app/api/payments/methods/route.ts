import { NextResponse } from "next/server";


export async function GET() {
return NextResponse.json({
methods: [
{ id: "mtn", type: "mobile_money", provider: "MTN" },
{ id: "airtel", type: "mobile_money", provider: "Airtel" },
{ id: "stripe", type: "card", provider: "Stripe" }
]
});
}