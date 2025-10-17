import crypto from "crypto";

type SignRequestBody = {
  folder?: string;
};

export async function POST(req: Request) {
  try {
    const { folder }: SignRequestBody = await req.json().catch(() => ({}));

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME;

    if (!apiKey || !apiSecret || !cloudName) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudinary environment variables" }),
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build string to sign: keys sorted alphabetically, exclude undefined/empty, then append apiSecret
    const params: Record<string, string | number> = { timestamp };
    if (folder) params.folder = folder;

    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(`${toSign}${apiSecret}`)
      .digest("hex");

    return Response.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: folder || null,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to sign upload" }), {
      status: 500,
    });
  }
}
