import imagekit from "@/configs/imageKits";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";
// Add a new product

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    // we'll need a middleware to get the specific  user id for the store id for that user
    const storeId = await authSeller(userId);

    // suppose we don't find any store Id for the user
    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // Get the data from the form
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const images = formData.getAll("images"); // We are getting multiple images

    if (
      !name ||
      !description ||
      !mrp ||
      !price ||
      !category ||
      images.length < 1
    ) {
      // "image > 1" meaning that there is no image
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    // Uploading Images to ImageKit
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });
        const url = imagekit.url({
          path: response.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "512" },
          ],
        });
        return url;
      })
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      }
    });

    return NextResponse.json({message: "Product added successfully"})
  } catch (error) {
    console.error();
    return NextResponse.json({error: error.code || error.message}, {status: 400})
  }
}
