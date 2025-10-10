import { User } from "../models/User.models.js";
import { Webhook } from "svix";

// Clerk webhook controller
export const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify webhook signature
    await wh.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        // Safely extract fields
        const email =
          data.email_addresses && data.email_addresses.length > 0
            ? data.email_addresses[0].email_address
            : `no-email-${data.id}@example.com`;

        const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unknown User";

        const image = data.image_url || "https://via.placeholder.com/150";

        // Create user only if not exists
        const existingUser = await User.findOne({ clerkId: data.id });
        if (!existingUser) {
          await User.create({
            _id: data.id,
            clerkId: data.id,
            email,
            name,
            image,
            resume: "",
          });
          console.log("Created new user from webhook:", email);
        }
        break;
      }

      case "user.updated": {
        const updates = {};
        if (data.first_name || data.last_name) updates.name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Unknown User";
        if (data.email_addresses && data.email_addresses.length > 0) updates.email = data.email_addresses[0].email_address;
        if (data.image_url) updates.image = data.image_url;

        if (Object.keys(updates).length > 0) {
          await User.findOneAndUpdate({ clerkId: data.id }, updates, { new: true });
          console.log("Updated user from webhook:", data.id);
        }
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        console.log("Deleted user from webhook:", data.id);
        break;
      }

      default:
        console.log("Unhandled webhook type:", type);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ success: false, message: "Webhook verification failed" });
  }
};
