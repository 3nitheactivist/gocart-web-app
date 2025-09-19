import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


// Get store info & store products
export async function GET(request) {
  try {
    // Get store username from query
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLowerCase();

    if(!username){
        return NextResponse.json({error: "missing username"}, {status: 400})
    }

    // Get store info and inStock products with ratings
    const store = await prisma.store.findFirst({
        where: { username, isActive: true },
        include: { Product: { where: { inStock: true }, include: { rating: true } } }
    })

    if(!store){
        return NextResponse.json({error: "store not found"}, {status: 404})
    }
    return NextResponse.json({store})
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: error.code || error.message}, {status: 400})
  }
}
