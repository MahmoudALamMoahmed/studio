import { NextResponse } from "next/server";
import { verifyTransaction } from "@/app/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("transactionId");

  const result = await verifyTransaction(orderId, transactionId);
  return NextResponse.json(result);
}
