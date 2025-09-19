import prisma from "@/lib/prisma";

// We have created a middleware called authSeller, it will provide the userId
// and it will return the store Id. And now we can add the product in this particular store

const authSeller = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    // if user has store and store is approved
    if (user.store) {
      if (user.store.status === "approved") {
        return user.store.id;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default authSeller;
