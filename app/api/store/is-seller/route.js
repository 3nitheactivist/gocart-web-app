import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth Seller
// API to get seller details: getting the store info's
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const storeInfo = await prisma.store.findUnique({ where: {userId}       
    });

    return NextResponse.json({isSeller, storeInfo}) // provided
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: error.code || error.message}, {status: 400})
  }
}
